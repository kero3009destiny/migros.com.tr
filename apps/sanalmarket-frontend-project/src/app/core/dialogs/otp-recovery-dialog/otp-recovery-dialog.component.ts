import { Component, EventEmitter, Output } from '@angular/core';

import { LoadingIndicatorService, STEPS } from '@fe-commerce/core';

import { throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { UserRestControllerService } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: `sm-otp-recovery-dialog`,
  template: `
    <sm-otp-dialog
      [currentStep]="currentStep"
      [onSendPhoneNumber]="onSendPhoneNumber"
      [onVerifyPhoneNumber]="onVerifyPhoneNumber"
      (userVerified)="onVerified($event)"
    ></sm-otp-dialog>
  `,
})
export class OtpRecoveryDialogComponent {
  currentStep = STEPS['verify'];

  @Output() userVerified = new EventEmitter<boolean>();

  constructor(
    private _loadingIndicatorService: LoadingIndicatorService,
    private _userRestController: UserRestControllerService
  ) {}

  onSendPhoneNumber = ({ data }) => {
    this._loadingIndicatorService.start();
    return this._userRestController
      .sendOtpForRecovery({
        phoneNumber: data.sendPhonePostData.phoneNumber,
        emailClaimId: data.sendPhonePostData.emailClaimId,
        emailClaimToken: data.sendPhonePostData.emailClaimToken,
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
        phoneNumberClaimToken: code,
        emailClaimToken: data.sendPhonePostData.emailClaimToken,
        emailClaimId: data.sendPhonePostData.emailClaimId,
      })
      .pipe(
        catchError((error) => throwError(error)),
        finalize(() => this._loadingIndicatorService.stop())
      );
  };

  onVerified(successful) {
    this.userVerified.emit(successful);
  }
}
