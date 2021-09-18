import { Component, EventEmitter, Output } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';

import { catchError, finalize, map } from 'rxjs/operators';

import { Observable, throwError } from 'rxjs';
import { AppResponse, ClaimInfoDTO, OtpAuthenticationControllerService } from '@migroscomtr/sanalmarket-angular';

import { STEPS } from '../otp-dialog/otp-dialog.ref';

@Component({
  selector: `sm-otp-login-dialog`,
  template: `
    <sm-otp-dialog
      [currentStep]="currentStep"
      [onSendPhoneNumber]="onSendPhoneNumber"
      [onVerifyPhoneNumber]="onVerifyPhoneNumber"
      (userVerified)="onVerified($event)"
    ></sm-otp-dialog>
  `,
})
export class OtpLoginDialogComponent {
  @Output() userVerified = new EventEmitter<boolean>();

  currentStep = STEPS['verify'];

  constructor(
    private _authenticationService: OtpAuthenticationControllerService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  onSendPhoneNumber = ({ additionalData: { phoneNumber } }): Observable<ClaimInfoDTO> => {
    this._loadingIndicatorService.start();
    return this._authenticationService.code({ phoneNumber }).pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data),
      finalize(() => this._loadingIndicatorService.stop())
    );
  };

  onVerifyPhoneNumber = ({ data, additionalData: { code } }): Observable<AppResponse> => {
    this._loadingIndicatorService.start();

    return this._authenticationService
      .login({
        phoneNumberClaimToken: code,
        phoneNumberClaimId: data.verifyPostData.claimId,
      })
      .pipe(
        catchError((error) => throwError(error)),
        finalize(() => this._loadingIndicatorService.stop())
      );
  };

  onVerified(successful: boolean): void {
    this.userVerified.emit(successful);
  }
}
