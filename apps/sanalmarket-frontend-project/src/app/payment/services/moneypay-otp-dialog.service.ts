import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { MoneypayOtpDialogService } from '@fe-commerce/line-payment-moneypay';

import { SmMoneyPayOtpDialogComponent } from '../../core/dialogs';

@Injectable({
  providedIn: 'root',
})
export class SmMoneypayOtpDialogService extends MoneypayOtpDialogService {
  constructor(otpDialog: MatDialog) {
    super(otpDialog);
  }

  startOTP() {
    if (this._dialogRef) {
      this._dialogRef.close();
    }
    this._dialogRef = this._otpDialog.open(SmMoneyPayOtpDialogComponent, {
      disableClose: true,
      panelClass: 'wide-dialog',
      data: this.INITIAL_VERIFY_DATA,
    });
    this._dialogRef.componentInstance.userVerified.subscribe(() => {
      this._dialogRef.close();
      this._userVerified$.next(true);
    });
  }
}
