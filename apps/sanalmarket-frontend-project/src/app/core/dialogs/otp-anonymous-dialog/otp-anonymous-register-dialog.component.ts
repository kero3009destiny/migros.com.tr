import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material-experimental/mdc-dialog';

import { STEPS } from '@fe-commerce/core';

import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { OtpRegistrationControllerV2Service } from '@migroscomtr/sanalmarket-angular';

const WRONG_OTP_CODE_ERROR = 31023;

@Component({
  template: `
    <sm-otp-dialog
      [currentStep]="currentStep"
      [onSendPhoneNumber]="onSendPhoneNumber.bind(this)"
      [onVerifyPhoneNumber]="onVerifyPhoneNumber.bind(this)"
      (userVerified)="onVerified($event)"
    ></sm-otp-dialog>
  `,
})
export class OtpAnonymousRegisterDialogComponent {
  currentStep = STEPS['verify'];
  @Output() userVerified = new EventEmitter<boolean>();

  constructor(
    private _registrationService: OtpRegistrationControllerV2Service,
    private _dialogRef: MatDialogRef<OtpAnonymousRegisterDialogComponent>
  ) {}

  onSendPhoneNumber = ({ additionalData: { phoneNumber, email } }) => {
    return this._registrationService.code1({ phoneNumber, email }).pipe(
      catchError((error) => {
        this._dialogRef.close();
        return throwError(error);
      }),
      map((response) => response.data)
    );
  };

  onVerifyPhoneNumber = ({ data, additionalData: { code } }) => {
    return this._registrationService
      .registerAnonymous({
        emailClaimId: data.verifyPostData.emailClaimId,
        emailClaimToken: data.verifyPostData.emailClaimToken,
        phoneNumberClaimId: data.verifyPostData.phoneNumberClaimId,
        phoneNumberClaimToken: code,
      })
      .pipe(
        catchError((error) => {
          if (this.isOTPDialogClosingAtErrorCode(error.status)) {
            this._dialogRef.close();
          }
          return throwError(error);
        })
      );
  };

  isOTPDialogClosingAtErrorCode(errorCode: number): boolean {
    return errorCode !== WRONG_OTP_CODE_ERROR;
  }

  onVerified(successful) {
    this.userVerified.emit(successful);
  }
}
