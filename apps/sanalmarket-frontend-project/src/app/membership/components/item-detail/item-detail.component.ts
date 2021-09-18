import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { CartService } from '@fe-commerce/line-cart';
import { MaxAmountInfoModel } from '@fe-commerce/shared';

import { OrderItemInfo, StoreProductInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ItemDetailComponent implements OnInit {
  @Input() itemInfo: OrderItemInfo;

  constructor(private _cartService: CartService, private _router: Router) {}

  ngOnInit(): void {
    return;
  }

  isInSale(itemInfo: OrderItemInfo): boolean {
    return itemInfo.product.status === 'IN_SALE';
  }

  getImgSrc(itemInfo: OrderItemInfo): string {
    return itemInfo.product.images[0].urls.PRODUCT_LIST;
  }
  getIncrementAmount(itemInfo: OrderItemInfo): number {
    const isSecondaryUnit = itemInfo?.item.unit !== itemInfo?.product.primaryUnit;
    return isSecondaryUnit ? itemInfo?.product.secondaryUnitIncrementAmount : itemInfo.product.incrementAmount;
  }
  getUnit(itemInfo: OrderItemInfo): StoreProductInfoDTO.UnitEnum | string {
    return itemInfo.item.unit ?? itemInfo.product.unit;
  }

  onClickItem(prettyName: string): void {
    this._router.navigate(['/' + prettyName]);
  }

  onReachMaxAmount(maxAmountInfo: MaxAmountInfoModel): void {
    this._cartService.maxAmountError(maxAmountInfo);
  }

  onUpdate(amount: number, item: OrderItemInfo): void {
    const {
      item: { productId, unit },
      product,
    } = item;
    this._cartService.update({ productId, amount, unit }, product);
  }
}
