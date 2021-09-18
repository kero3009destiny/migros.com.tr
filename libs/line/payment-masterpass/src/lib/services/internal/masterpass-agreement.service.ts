import { Injectable, OnDestroy } from '@angular/core';

import { Subscription, throwError } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';

import { CheckoutRestControllerService } from '@migroscomtr/sanalmarket-angular';

import { MasterpassStateService } from './masterpass-state.service';

@Injectable({
  providedIn: 'root',
})
export class MasterpassAgreementService implements OnDestroy {
  private _agreementSubscription: Subscription;

  constructor(
    private _masterpassStateService: MasterpassStateService,
    private _checkoutRestService: CheckoutRestControllerService
  ) {
    this._agreementSubscription = this._getAgreements();
  }

  ngOnDestroy() {
    if (this._agreementSubscription) {
      this._agreementSubscription.unsubscribe();
    }
  }

  private _getAgreements() {
    return this._masterpassStateService
      .getCheckoutId()
      .pipe(filter((checkoutId) => !!checkoutId))
      .subscribe((checkoutId) => {
        this._checkoutRestService
          .getMasterpassAgreement(checkoutId)
          .pipe(
            catchError((error) => throwError(error)),
            map((response) => response.data)
          )
          .subscribe((agreements) => {
            this._masterpassStateService.setAgreements(agreements);
          });
      });
  }
}
