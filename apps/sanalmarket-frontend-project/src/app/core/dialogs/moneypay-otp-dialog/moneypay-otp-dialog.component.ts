import { Component, EventEmitter, Output } from '@angular/core';

import { LoadingIndicatorService, STEPS } from '@fe-commerce/core';
import { MoneyPayOtpDialogComponent, MoneypayService } from '@fe-commerce/line-payment-moneypay';

import { throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

@Component({
  selector: `sm-money-pay-otp-dialog`,
  template: `
    <sm-otp-dialog
      [currentStep]="currentStep"
      [onSendPhoneNumber]="onSendPhoneNumber"
      [onVerifyPhoneNumber]="onVerifyPhoneNumber"
      (userVerified)="onVerified($event)"
    ></sm-otp-dialog>
  `,
})
export class SmMoneyPayOtpDialogComponent extends MoneyPayOtpDialogComponent {
  currentStep = STEPS['verify'];
  @Output() userVerified = new EventEmitter<boolean>();

  constructor(moneypayService: MoneypayService, loadingIndicatorService: LoadingIndicatorService) {
    super(moneypayService, loadingIndicatorService);
  }
}
