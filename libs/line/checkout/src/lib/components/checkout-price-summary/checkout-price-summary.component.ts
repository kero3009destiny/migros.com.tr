import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { SidePayment, SidePaymentDiscountInfo } from '@fe-commerce/line-payment';
import { SidePaymentFacade } from '@fe-commerce/line-payment-side';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { Observable, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CheckoutInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { CheckoutService } from '../../services';

enum DeliveryFeeStatus {
  BASE_PRICED,
  BASE_FREE,
  DISCOUNTED_PRICED,
  DISCOUNTED_FREE,
}

@Component({
  selector: 'fe-line-checkout-price-summary',
  templateUrl: './checkout-price-summary.component.html',
  styleUrls: ['./checkout-price-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPriceSummaryComponent extends SubscriptionAbstract implements OnInit, OnChanges {
  DeliveryFeeStatus = DeliveryFeeStatus;

  @Input() checkoutInfo: CheckoutInfoDTO;
  @Input() isCartPage = false;

  private _discountFeeStatus: DeliveryFeeStatus | null = null;

  private readonly SIDE_PAYMENT_LABEL_MAP = new Map<SidePayment, string>([
    ['COUPON', 'İndirim Çeki'],
    ['CARD_REWARD', 'Banka Puanı'],
    ['INSTANT_DISCOUNT', 'Anında İndirim'],
    ['INSTANT_DISCOUNT', 'Anında İndirim'],
    ['CUSTOMER_BOND', 'Money Pro'],
    ['PERSONNEL_BOND', 'Personel Bonosu'],
    ['MONEY_POINT', 'Money Puan'],
    ['VOUCHER', 'Dijital Alışveriş Kodu'],
  ]);
  private _usedSidePayment: SidePaymentDiscountInfo;

  constructor(
    private _sidePaymentService: SidePaymentFacade,
    private _ref: ChangeDetectorRef,
    private _checkoutService: CheckoutService
  ) {
    super();
  }

  ngOnInit() {
    this._sidePaymentService
      .getUsedSidePayment$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((usedSidePayment) => {
        this._usedSidePayment = usedSidePayment;
        this._ref.markForCheck();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.checkoutInfo && changes.checkoutInfo.currentValue) {
      const { deliveryPrice, shownDeliveryFee } = changes.checkoutInfo.currentValue as CheckoutInfoDTO;
      this._discountFeeStatus = this._getDeliveryFeeStatus(deliveryPrice, shownDeliveryFee);
    }
  }

  getDeliveryPrice(): number {
    return this.checkoutInfo.deliveryPrice;
  }

  getShownDeliveryPrice(): number {
    return this.checkoutInfo.shownDeliveryFee;
  }

  getRevenue$(): Observable<number> {
    return this.isCartPage
      ? of(this.checkoutInfo.revenue)
      : this._checkoutService.getCalculatedCheckoutRevenueToBePaid();
  }

  getUsedSidePayment(): SidePaymentDiscountInfo {
    return this._usedSidePayment;
  }

  getSidePaymentLabel(sidePayment: SidePayment): string {
    if (!this.SIDE_PAYMENT_LABEL_MAP.has(sidePayment)) {
      throw new Error(`Unknown payment type: ${sidePayment}`);
    }
    return this.SIDE_PAYMENT_LABEL_MAP.get(sidePayment);
  }

  getProductCount(): number {
    return this.checkoutInfo.itemInfos.length;
  }

  getDiscountFeeStatus(): DeliveryFeeStatus {
    return this._discountFeeStatus;
  }

  onRemoveSidePaymentClick(): void {
    this._sidePaymentService.cancelSidePayment();
  }

  private _getDeliveryFeeStatus(deliveryPrice: number, shownDeliveryFee: number): DeliveryFeeStatus {
    if (deliveryPrice === 0) {
      return DeliveryFeeStatus.BASE_FREE;
    }
    if (shownDeliveryFee === 0) {
      return DeliveryFeeStatus.DISCOUNTED_FREE;
    }
    if (deliveryPrice > shownDeliveryFee) {
      return DeliveryFeeStatus.DISCOUNTED_PRICED;
    }
    return DeliveryFeeStatus.BASE_PRICED;
  }
}
