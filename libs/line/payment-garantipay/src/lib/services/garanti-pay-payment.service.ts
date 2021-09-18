import { Injectable } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { MainPaymentService } from '@fe-commerce/line-payment';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { Subscription, throwError } from 'rxjs';
import { catchError, filter, finalize, map, takeUntil } from 'rxjs/operators';

import { CheckoutRestControllerService } from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class GarantiPayPaymentService extends SubscriptionAbstract implements MainPaymentService {
  constructor(
    private _checkoutRestService: CheckoutRestControllerService,
    private _checkoutService: CheckoutService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {
    super();
  }

  purchase(checkoutId, balance): Subscription {
    this._loadingIndicatorService.start();
    return this._checkoutRestService
      .purchaseGarantiPay(checkoutId, balance)
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => throwError(error)),
        map((response) => response.data),
        filter((data) => !!data),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((data: { key: string }) => {
        this.openBankWindow(data);
      });
  }

  private openBankWindow(data): void {
    document.open();
    document.write(data.key);
    document.close();
  }
}
