import { Injectable } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { BalanceType, SidePaymentDiscountInfo, SidePaymentInfo, SidePaymentService } from '@fe-commerce/line-payment';

import { Observable, ReplaySubject, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { CheckoutRestControllerService, EnhancedBalanceInfoForCrm } from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class BalanceService implements SidePaymentService {
  private _usedBalance$ = new ReplaySubject<SidePaymentInfo>(1);
  private _balancesMap$ = new ReplaySubject<Record<BalanceType, EnhancedBalanceInfoForCrm>>(1);

  constructor(
    private _checkoutRestController: CheckoutRestControllerService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  use(usedSidePayment: SidePaymentInfo, checkoutId: number, sidePayment?: string) {
    this._usedBalance$.next(usedSidePayment);
  }

  cancel() {
    this._usedBalance$.next(null);
  }

  getUsed$(): Observable<SidePaymentDiscountInfo> {
    return this._usedBalance$.pipe(
      map((balance) => {
        return balance === null ? null : { ...balance, discount: balance.value as number };
      })
    );
  }

  fetchBalances(checkoutId: number): Subscription {
    this._loadingIndicatorService.start();
    return this._checkoutRestController
      .balances(checkoutId)
      .pipe(
        catchError((err) => throwError(err)),
        map((response) => response.data),
        map((data) =>
          data.reduce(
            (prev, curr) => ({ ...prev, [curr.balanceInfo.balanceCode]: curr }),
            {} as Record<BalanceType, EnhancedBalanceInfoForCrm>
          )
        ),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((data: Record<BalanceType, EnhancedBalanceInfoForCrm>) => {
        this._balancesMap$.next(data);
      });
  }

  getBalancesMap$(): Observable<Record<BalanceType, EnhancedBalanceInfoForCrm>> {
    return this._balancesMap$.asObservable();
  }
}
