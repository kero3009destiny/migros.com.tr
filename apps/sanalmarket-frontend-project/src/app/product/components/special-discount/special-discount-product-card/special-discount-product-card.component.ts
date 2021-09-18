import { Component, Input } from '@angular/core';

import { GtmService } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';
import { MaxAmountInfoModel } from '@fe-commerce/shared';

import { CartItemInfoDTO, StoreProductInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-special-discount-product-card',
  templateUrl: './special-discount-product-card.component.html',
  styleUrls: ['./special-discount-product-card.component.scss'],
})
export class SpecialDiscountProductCardComponent {
  @Input() product: StoreProductInfoDTO;
  @Input() cartItem: CartItemInfoDTO;

  constructor(private _cartService: CartService, private _gtmService: GtmService) {}

  onUpdate(amount: number): void {
    const { id, unit } = this.product;
    this._cartService.update({ productId: id, amount, unit }, this.product, this.product.referrerEventId, true);
  }

  onMaxAmountReached(maxAmountInfo: MaxAmountInfoModel): void {
    this._cartService.maxAmountError(maxAmountInfo);
  }

  getUnit(): StoreProductInfoDTO.UnitEnum | string {
    return this.cartItem ? this.cartItem.item.unit : this.product.unit;
  }

  getIncrementAmount(): number {
    const isSecondaryUnit = this.cartItem?.item.unit !== this.cartItem?.product.primaryUnit;
    return isSecondaryUnit ? this.cartItem?.product.secondaryUnitIncrementAmount : this.product.incrementAmount;
  }

  sendGtmClickEvent(product: StoreProductInfoDTO): void {
    const list = 'Special Discount';
    this._gtmService.sendProductClickEvent({ product, list });
  }
}
