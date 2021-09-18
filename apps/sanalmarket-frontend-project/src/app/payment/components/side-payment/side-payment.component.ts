import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { CouponService } from '@fe-commerce/campaign-coupon';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { BalanceType, SidePayment, SidePaymentDiscountInfo, SidePaymentInfo } from '@fe-commerce/line-payment';
import { SidePaymentFacade } from '@fe-commerce/line-payment-side';
import { CouponInfoModel, SubscriptionAbstract } from '@fe-commerce/shared';

import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { EnhancedBalanceInfoForCrm } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-side-payment',
  templateUrl: './side-payment.component.html',
  styleUrls: ['./side-payment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidePaymentComponent extends SubscriptionAbstract implements OnInit {
  private _checkoutId: number;
  private _isAllSidePaymentsClosed: boolean;

  step: SidePayment;
  closedSidePayments: string[] = [];
  usedSidePayment: SidePaymentDiscountInfo;

  constructor(
    private _sidePaymentService: SidePaymentFacade,
    private _couponService: CouponService,
    private _checkoutService: CheckoutService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.getCheckoutId();
    this.fetchCoupons();
    this.fetchBalanceMap();
    this.getClosedSidePayments();
    this.subscribeToUsedSidePayment();
  }

  private subscribeToUsedSidePayment(): void {
    this._sidePaymentService
      .getUsedSidePayment$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((usedSidePayment) => {
        this.usedSidePayment = usedSidePayment;
        this._changeDetectorRef.markForCheck();
      });
  }

  private getCheckoutId(): void {
    this._checkoutService.checkout$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        map((checkout) => checkout.line.id)
      )
      .subscribe((id) => {
        this._checkoutId = id;
      });
  }

  private getClosedSidePayments(): void {
    this._checkoutService.checkout$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        map((checkout) => checkout.line)
      )
      .subscribe(({ closedPaymentTypes = '', derivedOrderId, disabledPaymentTypes = '' }) => {
        this.closedSidePayments = [...closedPaymentTypes.split('|'), ...disabledPaymentTypes.split('|')].filter(
          (type) => type.length > 0
        );
        this._isAllSidePaymentsClosed = !!derivedOrderId;
      });
  }

  private fetchCoupons(): void {
    this._checkoutService.checkout$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        map((checkout) => checkout.line.id),
        distinctUntilChanged()
      )
      .subscribe((id) => {
        this._couponService.getCoupons(id);
      });
  }

  private fetchBalanceMap(): void {
    this._checkoutService.checkout$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((checkout) => 'PAYMENT' === checkout.line.step),
        map((checkout) => checkout.line.id)
      )
      .subscribe((id) => {
        this._sidePaymentService.fetchBalances(id);
      });
  }

  getBalancesMap$(): Observable<Record<BalanceType, EnhancedBalanceInfoForCrm>> {
    return this._sidePaymentService.getBalancesMap$();
  }

  getCoupons$(): Observable<CouponInfoModel[]> {
    return this._couponService.getCoupons$();
  }

  setStep(index: SidePayment) {
    this.step = index;
  }

  onClosed(): void {
    this.step = null;
  }

  isPaymentClosed(payment: SidePayment): boolean {
    return this.closedSidePayments.includes(payment);
  }

  isAllSidePaymentsClosed(): boolean {
    return this._isAllSidePaymentsClosed;
  }

  onUsed($event: SidePaymentInfo): void {
    this._sidePaymentService.useSidePayment($event, this._checkoutId);
  }

  onCancelled(): void {
    this._sidePaymentService.cancelSidePayment();
  }
}
