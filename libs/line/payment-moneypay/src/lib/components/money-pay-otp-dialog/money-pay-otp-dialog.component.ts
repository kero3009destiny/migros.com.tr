import { Component, EventEmitter, Output } from '@angular/core';

import { LoadingIndicatorService, STEPS } from '@fe-commerce/core';

import { throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { MoneypayService } from '../../services/moneypay.service';

@Component({
  selector: `fe-money-pay-otp-dialog`,
  template: `
    <fe-auth-otp-dialog
      [currentStep]="currentStep"
      [onSendPhoneNumber]="onSendPhoneNumber"
      [onVerifyPhoneNumber]="onVerifyPhoneNumber"
      (userVerified)="onVerified($event)"
    ></fe-auth-otp-dialog>
  `,
})
export class MoneyPayOtpDialogComponent {
  currentStep = STEPS['verify'];
  @Output() userVerified = new EventEmitter<boolean>();

  constructor(
    protected _moneypayService: MoneypayService,
    protected _loadingIndicatorService: LoadingIndicatorService
  ) {}

  onSendPhoneNumber = ({ additionalData: { phoneNumber, email } }) => {
    this._loadingIndicatorService.start();
    return this._moneypayService.sendOtp$().pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  };

  onVerifyPhoneNumber = ({ data, additionalData: { code, permitContact, permitKvk } }) => {
    this._loadingIndicatorService.start();
    return this._moneypayService.verifyOtp$(code).pipe(
      catchError((error) => throwError(error)),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  };

  onVerified(successful) {
    this.userVerified.emit(successful);
  }
}
