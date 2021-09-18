import { Injectable } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { SidePaymentDiscountInfo, SidePaymentInfo, SidePaymentService } from '@fe-commerce/line-payment';
import { CouponInfoModel } from '@fe-commerce/shared';

import { BehaviorSubject, Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, filter, finalize, map } from 'rxjs/operators';

import { CheckoutRestControllerService } from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class CouponService implements SidePaymentService {
  private _coupons$ = new BehaviorSubject<CouponInfoModel[]>([]);

  private _usedCoupon$ = new ReplaySubject<CouponInfoModel>(1);

  constructor(
    private _couponRestService: CheckoutRestControllerService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  getCoupons$(): Observable<CouponInfoModel[]> {
    return this._coupons$.asObservable();
  }

  getUsedCoupon$(): Observable<CouponInfoModel> {
    return this._usedCoupon$.asObservable();
  }

  getCoupons(checkoutId: number): void {
    this._loadingIndicatorService.start();
    this._couponRestService
      .dryCoupons(checkoutId)
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.data),
        filter((data) => !!data),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((data) => {
        this._coupons$.next(data);
      });
  }

  getUsed$(): Observable<SidePaymentDiscountInfo> {
    return this.getUsedCoupon$().pipe(
      map((usedCoupon) => {
        return usedCoupon === null
          ? null
          : { type: 'COUPON', value: usedCoupon.identifier, discount: usedCoupon.discount };
      })
    );
  }

  use(usedSidePayment: SidePaymentInfo, checkoutId: number): void {
    this._loadingIndicatorService.start();
    this._couponRestService
      .dryCoupon(checkoutId, { couponCode: usedSidePayment.value.toString() })
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.data),
        filter((data) => !!data),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((data) => {
        this._usedCoupon$.next(data);
      });
  }

  cancel(): void {
    this._usedCoupon$.next(null);
  }
}
