import { Injectable } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { MainPaymentService } from '@fe-commerce/line-payment';

import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { MasterpassPurchaseService } from './internal';

@Injectable({
  providedIn: 'root',
})
export class MasterpassPaymentService implements MainPaymentService {
  constructor(
    private _masterpassPurchaseService: MasterpassPurchaseService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _checkoutService: CheckoutService
  ) {}

  purchase(checkoutId, balance): Subscription {
    this._loadingIndicatorService.start();
    return this._masterpassPurchaseService
      .pay(balance)
      .pipe(
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((paymentData) => {
        this._checkoutService.updateCheckoutStatus({ success: true });
      });
  }
}
