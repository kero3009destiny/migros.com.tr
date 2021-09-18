import { Injectable } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { MainPaymentService } from '@fe-commerce/line-payment';

import { Subscription, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import {
  CheckoutDTO,
  CheckoutPaymentCreditCardFormBean,
  CheckoutRestControllerService,
} from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class CardPaymentService implements MainPaymentService<CheckoutPaymentCreditCardFormBean> {
  constructor(
    private _checkoutRestService: CheckoutRestControllerService,
    private _checkoutService: CheckoutService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  purchase(checkoutId: number, form: CheckoutPaymentCreditCardFormBean): Subscription {
    this._loadingIndicatorService.start();
    return this._checkoutRestService
      .purchaseOnline(checkoutId, form)
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.data),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((paymentData: { key: string; line: CheckoutDTO }) => {
        if (!paymentData.key) {
          this._checkoutService.updateCheckoutStatus({ success: true });
        } else {
          this.openBankWindow(paymentData);
        }
      });
  }

  private openBankWindow(data): void {
    document.open();
    document.write(data.key);
    document.close();
  }
}
