import { Injectable } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { MainPaymentService } from '@fe-commerce/line-payment';

import { Subscription, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { CheckoutRestControllerService } from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class PaymentOnDeliveryService implements MainPaymentService {
  constructor(
    private _checkoutRestService: CheckoutRestControllerService,
    private _checkoutService: CheckoutService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  purchase(checkoutId, paymentBalance): Subscription {
    this._loadingIndicatorService.start();
    return this._checkoutRestService
      .purchaseOffline(checkoutId, paymentBalance)
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.data),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((paymentData) => {
        this._checkoutService.updateCheckoutStatus({ success: true });
      });
  }
}
