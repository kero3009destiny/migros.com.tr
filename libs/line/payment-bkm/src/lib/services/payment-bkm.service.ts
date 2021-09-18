import { Injectable } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { MainPaymentService } from '@fe-commerce/line-payment';

import { Subscription, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { CheckoutRestControllerService, PaymentRestControllerService } from '@migroscomtr/sanalmarket-angular';

import { BkmClientInterface } from '../models';

declare const Bex: BkmClientInterface;

@Injectable({
  providedIn: 'root',
})
export class PaymentBkmService implements MainPaymentService {
  constructor(
    private _checkoutRestService: CheckoutRestControllerService,
    private _checkoutService: CheckoutService,
    private _paymentRestService: PaymentRestControllerService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  purchase(checkoutId, balanceInfo): Subscription {
    this._loadingIndicatorService.start();
    return this._checkoutRestService
      .getBkmToken(checkoutId, balanceInfo)
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.data),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((data) => {
        this._openBankWindow(data, checkoutId, balanceInfo);
      });
  }

  private _openBankWindow(data, checkoutId, balanceInfo): void {
    Bex.init({ id: data.id, path: data.path, token: data.token }, 'modal', {
      container: 'bkm-modal',
      buttonSize: [135, 70],
      skipButton: true,
      onCancel: () => {
        this._loadingIndicatorService.start();
        this._paymentRestService
          .reinitializeBkm(checkoutId, balanceInfo)
          .pipe(
            catchError((error) => throwError(error)),
            map((response) => response.data),
            finalize(() => {
              this._loadingIndicatorService.stop();
            })
          )
          .subscribe((stringifiedTicket) => {
            const ticket = JSON.parse(stringifiedTicket);
            Bex.refresh(ticket);
          });
      },
      onComplete: () => {
        this._purchaseServerSide(checkoutId);
      },
    });
  }

  private _purchaseServerSide(checkoutId): Subscription {
    this._loadingIndicatorService.start();
    return this._checkoutRestService
      .purchaseBkm(checkoutId)
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.data),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe(() => {
        this._checkoutService.updateCheckoutStatus({ success: true });
      });
  }
}
