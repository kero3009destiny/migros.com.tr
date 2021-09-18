import { Component, EventEmitter, Output } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';

import { throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { UserRestControllerService } from '@migroscomtr/sanalmarket-angular';

import { STEPS } from '../otp-dialog/otp-dialog.ref';

@Component({
  template: `
    <sm-otp-dialog
      [currentStep]="currentStep"
      [onSendPhoneNumber]="onSendPhoneNumber"
      [onVerifyPhoneNumber]="onVerifyPhoneNumber"
      [onVerifyEmail]="onVerifyEmail"
      [onSendEmail]="onSendEmail"
      (userVerified)="onVerified($event)"
    ></sm-otp-dialog>
  `,
})
export class OtpRecoveryEmailDialogComponent {
  currentStep = STEPS['verifyEmail'];
  @Output() userVerified = new EventEmitter<boolean>();

  constructor(
    private _loadingIndicatorService: LoadingIndicatorService,
    private _userRestController: UserRestControllerService
  ) {}

  onVerifyEmail = ({ data, additionalData: { emailClaimToken } }) => {
    this._loadingIndicatorService.start();

    return this._userRestController
      .verifyRecoveryMail({
        emailClaimId: data.verifyRecoveryEmailData.emailClaimId,
        emailClaimToken,
      })
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.successful),
        finalize(() => this._loadingIndicatorService.stop())
      );
  };

  onSendPhoneNumber = ({ data, additionalData: { phoneNumber } }) => {
    this._loadingIndicatorService.start();

    return this._userRestController
      .sendOtpForRecovery({
        phoneNumber,
        emailClaimId: data.verifyRecoveryEmailData.emailClaimId,
        emailClaimToken: data.verifyRecoveryEmailData.emailClaimToken,
      })
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.data),
        finalize(() => this._loadingIndicatorService.stop())
      );
  };

  onVerifyPhoneNumber = ({ data, additionalData: { code } }) => {
    this._loadingIndicatorService.start();

    return this._userRestController
      .recover({
        phoneNumberClaimId: data.verifyPostData.claimId,
        emailClaimId: data.verifyRecoveryEmailData.emailClaimId,
        emailClaimToken: data.verifyRecoveryEmailData.emailClaimToken,
        phoneNumberClaimToken: code,
      })
      .pipe(
        catchError((error) => throwError(error)),
        finalize(() => this._loadingIndicatorService.stop())
      );
  };

  onSendEmail = ({ data }) => {
    this._loadingIndicatorService.start();

    return this._userRestController.sendRecoveryMail({ email: data.verifyRecoveryEmailData.email }).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      map((response) => response.data),
      finalize(() => this._loadingIndicatorService.stop())
    );
  };

  onVerified(successful) {
    this.userVerified.emit(successful);
  }
}
