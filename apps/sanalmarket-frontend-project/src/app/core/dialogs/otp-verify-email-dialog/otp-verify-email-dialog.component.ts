import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { UserService } from '@fe-commerce/core';

import { STEPS } from '../otp-dialog/otp-dialog.ref';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';

@Component({
  template: `
    <sm-otp-dialog
      [currentStep]="currentStep"
      [onVerifyEmail]="onVerifyEmail"
      (userVerified)="onVerified($event)"
    ></sm-otp-dialog>
  `,
})
export class OtpVerifyEmailDialogComponent {
  currentStep = STEPS['verifyMembershipEmail'];
  @Output() userVerified = new EventEmitter<boolean>();

  constructor(private _userService: UserService, private successDialog: MatDialog) {}

  onVerifyEmail = ({ data, additionalData: { code } }) => {
    return this._userService.verifyMail({
      emailClaimId: data.verifyEmailData.claimId,
      emailClaimToken: code,
    });
  };

  onVerified(successful: boolean) {
    this.successDialog.open(SuccessDialogComponent, {
      panelClass: 'wide-dialog',
      data: { message: 'E-posta Adresin Başarılı Bir Şekilde Doğrulanmıştır.' },
    });

    this.userVerified.emit(successful);
  }
}
