import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { GtmService, LoadingIndicatorService, ProductService } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';
import {
  GtmDataModel,
  presenceAnimationFasterTrigger,
  ProductInfoModel,
  SubscriptionAbstract,
} from '@fe-commerce/shared';

import { takeUntil } from 'rxjs/operators';

import { faHeart } from '@fortawesome/pro-light-svg-icons';
import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons';
import { CartInfoDTO, CartItemInfoDTO, StoreProductInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { ROUTE_MEMBERSHIP } from '../../../routes';

@Component({
  selector: 'sm-favorite-items',
  templateUrl: './favorite-items.component.html',
  styleUrls: ['./favorite-items.component.scss'],
  animations: [presenceAnimationFasterTrigger],
  encapsulation: ViewEncapsulation.None,
})
export class FavoriteItemsPage extends SubscriptionAbstract implements OnInit {
  // ICON
  backIcon = faArrowLeft;
  heartEmptyIcon = faHeart;

  // DATA
  private favoriteProducts: StoreProductInfoDTO[];
  private categorizedFavoriteProducts: StoreProductInfoDTO[];
  private _cartInfo: CartInfoDTO;

  // STATE
  private loading = true;

  private _itemsCount = 0;

  private _totalPageCount: number;
  private _shownPageIndexes: number[] = [];
  private _pageIndex = 1;

  constructor(
    private productService: ProductService,
    private loadingIndicatorService: LoadingIndicatorService,
    private cdr: ChangeDetectorRef,
    private gtmService: GtmService,
    private router: Router,
    private _cartService: CartService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initialize();
    this.sendGtmPageViewEvent('FavoriteItems', 'Favori Ürünlerim | Sanal Market');
  }

  isLoading(): boolean {
    return this.loading;
  }

  hasFavoriteItems(): boolean {
    if (!this.favoriteProducts) {
      return false;
    }
    return this.favoriteProducts.length > 0;
  }

  getTotalFavoriteItemsSize(): number {
    return this._itemsCount;
  }

  getCategorizedFavoriteItems(): StoreProductInfoDTO[] {
    return this.categorizedFavoriteProducts;
  }

  getCartItem(product: StoreProductInfoDTO): CartItemInfoDTO {
    return this._cartInfo.itemInfos?.find((cartItemInfo) => cartItemInfo.product.sku === product.sku);
  }

  getPageIndex(): number {
    return this._pageIndex;
  }

  setPageIndex(page: number): void {
    this._pageIndex = page;
  }

  resetPageIndex(): void {
    this.setPageIndex(1);
  }

  getShownPageIndexes(): number[] {
    return this._shownPageIndexes;
  }

  getTotalPageCount(): number {
    return this._totalPageCount;
  }

  getGtmData(product: ProductInfoModel): GtmDataModel[] {
    const gtmListName = 'favorite/Favori Ürünlerim';
    return [
      {
        name: 'impression',
        product,
        list: gtmListName,
      },
    ];
  }

  onChangeFilter(event: any): void {
    this.sortByDate();
  }

  onClickBackButton(): void {
    this.router.navigate([ROUTE_MEMBERSHIP]);
  }

  onRemoveProductFromList(id: number): void {
    this.favoriteProducts = this.favoriteProducts.filter((product) => {
      return product.id !== id;
    });
    this.categorizeFavouriteProducts(this.favoriteProducts);
  }

  onPageChanged(pageIndex: number): void {
    this.setPageIndex(pageIndex);
    scrollTo(0, 0);
    this._getFavoriteProducts();
  }

  sortByDate(): void {
    // TODO will be coded after date param returns
  }

  categorizeFavouriteProducts(favouriteProducts: StoreProductInfoDTO[]): void {
    // Categorizes the uncategorized products of array to handle them easily with ngfor loop in template.
    this.categorizedFavoriteProducts = Object.entries(
      favouriteProducts.reduce((acc, cur) => {
        const suitableCategoryName = acc[cur.category.name] || [];
        acc[cur.category.name] = [...suitableCategoryName, cur];
        return acc;
      }, {})
    ) as StoreProductInfoDTO[];
  }

  initialize(): void {
    this.loading = true;
    this._getFavoriteProducts();
    this._subscribeToCart();
    this._subscribeToFavoriteProductIds();
  }

  private _subscribeToFavoriteProductIds(): void {
    this.productService
      .getFavouriteProductIds()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((ids) => {
        this._itemsCount = ids.length;
        this._totalPageCount = Math.ceil(ids.length / 24);
      });
  }

  private _getFavoriteProducts(): void {
    this.productService.getFavoriteProducts(this._pageIndex).subscribe((favoriteProducts) => {
      this.favoriteProducts = favoriteProducts;
      this.categorizeFavouriteProducts(this.favoriteProducts);
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  private _subscribeToCart(): void {
    this._cartService.cart$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((cartInfo) => {
      this._cartInfo = cartInfo;
      this.cdr.detectChanges();
    });
  }

  private sendGtmPageViewEvent(pageComponentName: string, pageTitle: string): void {
    this.gtmService.sendPageView({
      event: `virtualPageview${pageComponentName}`,
      virtualPagePath: this.router.url,
      virtualPageTitle: pageTitle,
      virtualPageName: pageComponentName,
    });
  }
}
