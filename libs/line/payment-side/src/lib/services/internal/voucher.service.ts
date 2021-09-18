import { Injectable } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { SidePaymentDiscountInfo, SidePaymentInfo, SidePaymentService } from '@fe-commerce/line-payment';

import { Observable, ReplaySubject, Subscription, throwError } from 'rxjs';
import { catchError, filter, finalize, map } from 'rxjs/operators';

import { CheckoutRestControllerService } from '@migroscomtr/sanalmarket-angular';

import { VoucherCodeInfo } from '../../model';

@Injectable({
  providedIn: 'root',
})
export class VoucherService implements SidePaymentService {
  private _usedVoucher$ = new ReplaySubject<VoucherCodeInfo>(1);

  constructor(
    private _checkoutRestController: CheckoutRestControllerService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  use(sidePaymentInfo: SidePaymentInfo, checkoutId: number): Subscription {
    this._loadingIndicatorService.start();
    return this._checkoutRestController
      .dryVoucher(checkoutId, { voucherCode: sidePaymentInfo.value.toString() })
      .pipe(
        catchError((error) => {
          this.cancel();
          return throwError(error);
        }),
        map((response) => response.data),
        filter((data) => !!data),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((voucherInfo) => {
        this._usedVoucher$.next({ ...voucherInfo, code: sidePaymentInfo.value.toString() });
      });
  }

  getUsed$(): Observable<SidePaymentDiscountInfo> {
    return this.getUsedVoucher$().pipe(
      map((usedVoucher) => {
        return usedVoucher === null
          ? null
          : { type: 'VOUCHER', value: usedVoucher.code, discount: usedVoucher.discount };
      })
    );
  }

  cancel(): void {
    this._usedVoucher$.next(null);
  }

  getUsedVoucher$(): Observable<VoucherCodeInfo> {
    return this._usedVoucher$.asObservable();
  }
}
