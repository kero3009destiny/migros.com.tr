import { Component, EventEmitter, Output } from '@angular/core';

import { UserService } from '@fe-commerce/core';

import { STEPS } from '../otp-dialog/otp-dialog.ref';

@Component({
  template: `
    <sm-otp-dialog
      [currentStep]="currentStep"
      [onSendPhoneNumber]="onSendPhoneNumber"
      [onVerifyPhoneNumber]="onUpdatePhoneNumber"
      (userVerified)="onVerified($event)"
    ></sm-otp-dialog>
  `,
})
export class OtpUpdatePhoneDialogComponent {
  currentStep = STEPS['verify'];

  @Output() userVerified = new EventEmitter<boolean>();

  constructor(private _userService: UserService) {}

  onSendPhoneNumber = ({ additionalData }) => {
    const { phoneNumber } = additionalData;
    return this._userService.sendOtpForPhoneNumberUpdate(phoneNumber);
  };

  onUpdatePhoneNumber = ({ data, additionalData: { code } }) => {
    const { claimId } = data.verifyPostData;
    return this._userService.updatePhoneNumberByOtp({ phoneNumberClaimToken: code, phoneNumberClaimId: claimId });
  };

  onVerified(successful: boolean) {
    this.userVerified.emit(successful);
  }
}
