import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { CouponService } from '@fe-commerce/campaign-coupon';
import { InstantDiscountService } from '@fe-commerce/campaign-instant-discount';
import {
  BalanceType,
  SidePayment,
  SidePaymentDiscountInfo,
  SidePaymentInfo,
  SidePaymentService,
} from '@fe-commerce/line-payment';

import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { EnhancedBalanceInfoForCrm } from '@migroscomtr/sanalmarket-angular';

import { SidePaymentOverrideModalComponent } from '../components';
import { BalanceService } from './internal/balance.service';
import { CardRewardService } from './internal/card-reward.service';
import { VoucherService } from './internal/voucher.service';

@Injectable({
  providedIn: 'root',
})
export class SidePaymentFacade implements OnDestroy {
  private _usedSidePaymentType: SidePayment | null = null;
  private _usedSidePayment$ = new ReplaySubject<SidePaymentDiscountInfo>(1);

  private readonly SIDE_PAYMENT_SERVICE_MAP = new Map<SidePayment, SidePaymentService>([
    ['INSTANT_DISCOUNT', this._instantDiscountService],
    ['COUPON', this._couponService],
    ['VOUCHER', this._voucherService],
    ['MONEY_POINT', this._balanceService],
    ['CUSTOMER_BOND', this._balanceService],
    ['PERSONNEL_BOND', this._balanceService],
    ['CARD_REWARD', this._cardRewardService],
  ]);

  private _subscription = new Subscription();

  constructor(
    private _couponService: CouponService,
    private _voucherService: VoucherService,
    private _instantDiscountService: InstantDiscountService,
    private _balanceService: BalanceService,
    private _cardRewardService: CardRewardService,
    //
    private _dialog: MatDialog
  ) {
    this.subscribeToSidePaymentServices().forEach((sub) => {
      this._subscription.add(sub);
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  private subscribeToSidePaymentServices(): Subscription[] {
    return Array.from(this.SIDE_PAYMENT_SERVICE_MAP.entries()).map(([key, service]) =>
      service
        .getUsed$()
        .pipe(
          filter(
            (used) =>
              // different side payment type can't clear used side payment
              !!used || this._usedSidePaymentType === key
          )
        )
        .subscribe((used) => {
          this._usedSidePayment$.next(used);
          this._usedSidePaymentType = used?.type ?? null;
        })
    );
  }

  useSidePayment(usedSidePayment: SidePaymentInfo, checkoutId: number): void {
    if (this._usedSidePaymentType !== null) {
      this._openOverrideDialog(usedSidePayment, checkoutId);
      return;
    }
    this._updateSidePayment(usedSidePayment, checkoutId);
  }

  cancelSidePayment(): void {
    if (this._usedSidePaymentType !== null) {
      this.SIDE_PAYMENT_SERVICE_MAP.get(this._usedSidePaymentType).cancel();
    }
  }

  fetchBalances(checkoutId: number): Subscription {
    return this._balanceService.fetchBalances(checkoutId);
  }

  getUsedSidePayment$(): Observable<SidePaymentDiscountInfo> {
    return this._usedSidePayment$.asObservable();
  }

  getBalancesMap$(): Observable<Record<BalanceType, EnhancedBalanceInfoForCrm>> {
    return this._balanceService.getBalancesMap$();
  }

  private _openOverrideDialog(usedSidePayment: SidePaymentInfo, checkoutId: number): void {
    const dialogRef = this._dialog.open(SidePaymentOverrideModalComponent);
    const overrideAcceptedSub = dialogRef.componentInstance.overrideAccepted.subscribe(() => {
      this._updateSidePayment(usedSidePayment, checkoutId);
      dialogRef.close();
    });
    const overrideDeniedSub = dialogRef.componentInstance.overrideDenied.subscribe(() => {
      dialogRef.close();
    });
    dialogRef.afterClosed().subscribe(() => {
      overrideAcceptedSub.unsubscribe();
      overrideDeniedSub.unsubscribe();
    });
  }

  private _updateSidePayment(usedSidePayment: SidePaymentInfo, checkoutId: number): void {
    if (!this.SIDE_PAYMENT_SERVICE_MAP.has(usedSidePayment.type)) {
      throw new Error(
        `Unknown payment detected while updating the side payment. Side payment: ${this._usedSidePaymentType}`
      );
    }
    this.cancelSidePayment();
    this._usedSidePaymentType = usedSidePayment.type;
    this.SIDE_PAYMENT_SERVICE_MAP.get(this._usedSidePaymentType).use(usedSidePayment, checkoutId);
  }
}
