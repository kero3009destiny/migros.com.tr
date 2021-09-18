import { Component, EventEmitter, Output } from '@angular/core';

import { UserService } from '@fe-commerce/core';

import { STEPS } from '../otp-dialog/otp-dialog.ref';

@Component({
  template: `
    <sm-otp-dialog
      [currentStep]="currentStep"
      [onSendPhoneNumber]="onSendOtpForEmail"
      [onVerifyPhoneNumber]="onUpdateEmail"
      (userVerified)="onVerified($event)"
    ></sm-otp-dialog>
  `,
})
export class OtpUpdateEmailDialogComponent {
  currentStep = STEPS['verify'];

  @Output() userVerified = new EventEmitter<boolean>();

  constructor(private _userService: UserService) {}

  onSendOtpForEmail = ({ additionalData: { email } }) => {
    return this._userService.sendOtpForEmailUpdate(email);
  };

  onUpdateEmail = ({ data, additionalData: { code } }) => {
    return this._userService.updateEmailByOtp({
      emailClaimId: data.verifyPostData.emailClaimId,
      emailClaimToken: data.verifyPostData.emailClaimToken,
      phoneNumberClaimId: data.verifyPostData.phoneNumberClaimId,
      phoneNumberClaimToken: code,
    });
  };

  onVerified(successful: boolean): void {
    this.userVerified.emit(successful);
  }
}
