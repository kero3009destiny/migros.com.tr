import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CartService } from '@fe-commerce/line-cart';
import { CheckoutAdditionalService } from '@fe-commerce/line-checkout';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { faInfoCircle, IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { CartItemInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { ROUTE_CART } from '../../../../../routes';

@Component({
  selector: 'sm-cart-dropdown-list',
  templateUrl: './cart-dropdown-list.component.html',
  styleUrls: ['./cart-dropdown-list.component.scss'],
})
export class CartDropdownListComponent extends SubscriptionAbstract implements OnInit {
  infoIcon: IconDefinition = faInfoCircle;

  private totalProductPrice: number;
  private minimumRequiredRevenue: number;
  private _isInAdditionalCheckoutMode = false;

  constructor(
    private cartService: CartService,
    private router: Router,
    private _checkoutAdditionalService: CheckoutAdditionalService
  ) {
    super();
  }

  ngOnInit() {
    this.cartService.cart$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((cart) => {
      this.minimumRequiredRevenue = cart.minimumRequiredRevenue;
      this.totalProductPrice = cart.totalProductPrice;
    });
    this._checkoutAdditionalService.isActive$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((status) => {
      this._isInAdditionalCheckoutMode = status.isActive ?? false;
    });
  }

  isMinimumAmountBarVisible(): boolean {
    if (this._isInAdditionalCheckoutMode) {
      return false;
    }
    return this.totalProductPrice < this.minimumRequiredRevenue;
  }

  getMinimumRequiredRevenue(): number {
    return this.minimumRequiredRevenue;
  }

  getBasketBarPercentageAmount(): string {
    return `${((100 * this.totalProductPrice) / this.minimumRequiredRevenue).toFixed(2)}%`;
  }

  getCartItemInfos$(): Observable<CartItemInfoDTO[]> {
    return this.cartService.cartItems$;
  }

  onClickRouteToBasket(): void {
    this.router.navigateByUrl(ROUTE_CART);
  }

  trackByFn(_index: number, cartItemInfo: CartItemInfoDTO): number {
    return cartItemInfo.item.productId;
  }
}
