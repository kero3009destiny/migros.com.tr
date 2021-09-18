import { Component, EventEmitter, Output } from '@angular/core';

import { LoadingIndicatorService, STEPS } from '@fe-commerce/core';

import { throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { OtpRegistrationControllerV2Service } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: `sm-otp-register-dialog`,
  template: `
    <sm-otp-dialog
      [currentStep]="currentStep"
      [onSendPhoneNumber]="onSendPhoneNumber"
      [onVerifyPhoneNumber]="onVerifyPhoneNumber"
      (userVerified)="onVerified($event)"
    ></sm-otp-dialog>
  `,
})
export class OtpRegisterDialogComponent {
  currentStep = STEPS['verify'];
  @Output() userVerified = new EventEmitter<boolean>();

  constructor(
    private _registrationService: OtpRegistrationControllerV2Service,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  onSendPhoneNumber = ({ additionalData: { phoneNumber, email } }) => {
    this._loadingIndicatorService.start();
    return this._registrationService.code1({ phoneNumber, email }).pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  };

  onVerifyPhoneNumber = ({ data, additionalData: { code, permitContact, permitKvk } }) => {
    this._loadingIndicatorService.start();
    return this._registrationService
      .register({
        acceptAgreement: permitKvk,
        emailClaimId: data.verifyPostData.emailClaimId,
        emailClaimToken: data.verifyPostData.emailClaimToken,
        permitContact,
        phoneNumberClaimId: data.verifyPostData.phoneNumberClaimId,
        phoneNumberClaimToken: code,
      })
      .pipe(
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
