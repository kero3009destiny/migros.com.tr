import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { GtmService, ProductService } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';
import { MaxAmountInfoModel, SubscriptionAbstract } from '@fe-commerce/shared';

import { takeUntil } from 'rxjs/operators';

import { BehaviorSubject, Observable } from 'rxjs';
import { faHeart as faHeartEmpty } from '@fortawesome/pro-light-svg-icons';
import { faHeart as faHearthFull } from '@fortawesome/pro-solid-svg-icons';
import { CartItemInfoDTO, StoreProductInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-list-page-item',
  templateUrl: './list-page-item.component.html',
  styleUrls: ['./list-page-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListPageItemComponent extends SubscriptionAbstract implements OnInit {
  @Input() product: StoreProductInfoDTO;
  @Input() cartItem: CartItemInfoDTO;
  @Input() pageItemLocation: string;
  @Output() unFavoured = new EventEmitter<number>();
  @Output() productClicked = new EventEmitter();

  heartEmptyIcon = faHeartEmpty;
  heartFullIcon = faHearthFull;

  private _isFavourite = new BehaviorSubject(false);

  constructor(
    private _cartService: CartService,
    private _productService: ProductService,
    private _gtmService: GtmService
  ) {
    super();
  }

  ngOnInit(): void {
    this._productService
      .getFavouriteProductIds()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((ids) => {
        this._isFavourite.next(ids.includes(this.product.id));
      });
  }

  isFavourite$(): Observable<boolean> {
    return this._isFavourite.asObservable();
  }

  onUpdate(amount: number): void {
    const { id, unit } = this.product;
    this._cartService.update({ productId: id, amount, unit }, this.product);
  }

  onMaxAmountReached(maxAmountInfo: MaxAmountInfoModel): void {
    this._cartService.maxAmountError(maxAmountInfo);
  }

  onAddFavouriteProduct(id: number): void {
    this._productService
      .addFavouriteProduct(id)
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(() => {
        this._isFavourite.next(true);
        this._gtmService.sendProductAddFavouriteEvent(id);
      });
  }

  onRemoveFavouriteProduct(id: number): void {
    this._productService
      .removeFavouriteProduct(id)
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(() => {
        this._isFavourite.next(false);
        this.unFavoured.emit(id);
      });
  }

  getUnit(): StoreProductInfoDTO.UnitEnum | string {
    return this.cartItem ? this.cartItem.item.unit : this.product.unit;
  }

  getIncrementAmount(): number {
    const isSecondaryUnit = this.cartItem?.item.unit !== this.cartItem?.product.primaryUnit;
    return isSecondaryUnit ? this.cartItem?.product.secondaryUnitIncrementAmount : this.product.incrementAmount;
  }

  getDiscountPercent(): null | number {
    if (this.product.regularPrice === this.product.shownPrice) {
      return null;
    }
    return 100 - Math.round((100 * this.product.shownPrice) / this.product.regularPrice);
  }

  hasProductBadge(): boolean {
    return this.product?.badges.filter((badge) => badge.name === 'CROSS_PROMOTED').length !== 0;
  }

  getProductBadgeLabel(): string {
    return this.product?.badges.filter((badge) => badge.name === 'CROSS_PROMOTED')[0]?.value?.toLocaleUpperCase('tr');
  }

  hasSpecialBadge(): boolean {
    return this.product?.badges.filter((badge) => badge.name === 'SPECIAL_PROMOTED').length !== 0;
  }

  getSpecialBadgeLabel(): string {
    return this.product?.badges.filter((badge) => badge.name === 'SPECIAL_PROMOTED')[0]?.value.toLocaleUpperCase('tr');
  }

  hasCrmBadge(): boolean {
    return this.product?.crmDiscountTags.length !== 0;
  }

  getCrmBadgeLabel(): string {
    return this.product?.crmDiscountTags[0]?.tag.toLocaleUpperCase('tr');
  }

  sendGtmClickEvent(product: StoreProductInfoDTO): void {
    const list = this.pageItemLocation;
    this._gtmService.sendProductClickEvent({ product, list });
    this.productClicked.emit();
  }
}
