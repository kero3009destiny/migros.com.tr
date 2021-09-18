import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material-experimental/mdc-dialog';

import { OtpDialogDataModel } from '@fe-commerce/shared';

import { BehaviorSubject, Observable } from 'rxjs';

import { MoneyPayOtpDialogComponent } from '../components/money-pay-otp-dialog/money-pay-otp-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class MoneypayOtpDialogService {
  // TODO cleanup
  readonly INITIAL_VERIFY_DATA: OtpDialogDataModel = {
    sendPhonePostData: {},
    successNotificationConfig: {
      title: 'SMS Doğrulama',
      message: 'Cep telefonu numaranız doğrulandı.',
    },
    verifyPostData: {},
  };

  protected _dialogRef: MatDialogRef<MoneyPayOtpDialogComponent>;
  protected _userVerified$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(protected _otpDialog: MatDialog) {}

  getUserVerified$(): Observable<boolean> {
    return this._userVerified$.asObservable();
  }

  startOTP() {
    if (this._dialogRef) {
      this._dialogRef.close();
    }
    this._dialogRef = this._otpDialog.open(MoneyPayOtpDialogComponent, {
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
