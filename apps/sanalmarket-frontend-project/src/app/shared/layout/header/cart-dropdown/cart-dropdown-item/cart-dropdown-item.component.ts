import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { GtmService } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';
import { MaxAmountInfoModel, ProductActionsComponent, SubscriptionAbstract } from '@fe-commerce/shared';

import { filter, takeUntil } from 'rxjs/operators';

import { faTrashAlt, IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { CartItemInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-cart-dropdown-item',
  templateUrl: './cart-dropdown-item.component.html',
  styleUrls: ['./cart-dropdown-item.component.scss'],
})
export class CartDropdownItemComponent extends SubscriptionAbstract implements OnInit {
  @Input() cartItem: CartItemInfoDTO;
  @ViewChild('action') productCardActionRef?: ProductActionsComponent;
  trashIcon: IconDefinition = faTrashAlt;

  constructor(private cartService: CartService, private gtmService: GtmService) {
    super();
  }

  ngOnInit() {
    this.subscribeToCartError();
  }

  isBadgeVisible(): boolean {
    return this.cartItem.product.badges[0] && this.cartItem.product.badges[0].name === 'CROSS_PROMOTED';
  }

  private subscribeToCartError(): void {
    this.cartService.cartError$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((response: any) => response.productId)
      )
      .subscribe((cartError) => {
        this.handleCartError(cartError);
      });
  }

  private handleCartError({ productId }): void {
    if (this.cartItem.item.productId === productId) {
      this.productCardActionRef?.rollback();
    }
  }

  onUpdate(amount: number): void {
    const {
      item: { productId, unit },
      product,
    } = this.cartItem;
    this.cartService.update({ productId, amount, unit }, product, this.cartItem.referrerEventId, false);
  }

  onMaxAmountReached(maxAmountInfo: MaxAmountInfoModel): void {
    this.cartService.maxAmountError(maxAmountInfo);
  }

  getIncrementAmount(cartItem: CartItemInfoDTO): number {
    const isSecondaryUnit = cartItem.item.unit !== cartItem.product.primaryUnit;
    return isSecondaryUnit ? cartItem.product.secondaryUnitIncrementAmount : cartItem.product.incrementAmount;
  }

  getInitialIncrementAmount(cartItem: CartItemInfoDTO): number {
    const isSecondaryUnit = cartItem.item.unit !== cartItem.product.primaryUnit;
    return isSecondaryUnit
      ? cartItem.product.secondaryUnitInitialIncrementAmount
      : cartItem.product.initialIncrementAmount;
  }

  deleteItem(): void {
    const {
      item: { productId, unit },
      product,
    } = this.cartItem;
    this.cartService.update({ productId, amount: 0, unit }, product, this.cartItem.referrerEventId, false);
  }

  sendGtmClickEvent(cartItem: CartItemInfoDTO): void {
    const product = { ...cartItem.product, id: cartItem.item.productId };
    const list = 'Cart Dropdown';
    this.gtmService.sendProductClickEvent({ product, list });
  }
}
