import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { LoadingIndicatorService } from '@fe-commerce/core';
import {
  MasterpassOtpService,
  MasterpassStateService,
  TITLE_MAP,
  ValidationStatus,
} from '@fe-commerce/line-payment-masterpass';
import { OtpDialogDataModel } from '@fe-commerce/shared';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { SmMasterpassOtpDialogComponent } from '../../core/dialogs';

const INITIAL_VERIFY_DATA: OtpDialogDataModel = {
  sendPhonePostData: {},
  successNotificationConfig: {
    title: 'SMS Doğrulama',
    message: 'Cep telefonu numaranız doğrulandı.',
  },
  verifyPostData: {},
};

@Injectable({
  providedIn: 'root',
})
export class SmMasterpassOtpService extends MasterpassOtpService {
  constructor(
    _otpFormDialog: MatDialog,
    _masterpassStateService: MasterpassStateService,
    _loadingIndicatorService: LoadingIndicatorService
  ) {
    super(_otpFormDialog, _masterpassStateService, _loadingIndicatorService);
  }

  _openModal(): Subscription {
    return this._masterpassStateService
      .getValidationStatus()
      .pipe(
        filter((status) => status === ValidationStatus.BANK_VALIDATION || status === ValidationStatus.MP_VALIDATION)
      )
      .subscribe((status) => {
        if (this._dialogRef) {
          this._dialogRef.close();
        }
        this._dialogRef = this._otpFormDialog.open(SmMasterpassOtpDialogComponent, {
          disableClose: true,
          autoFocus: false,
          panelClass: 'wide-dialog',
          data: {
            ...INITIAL_VERIFY_DATA,
            verifyPostData: {
              title: TITLE_MAP[status],
            },
          },
          closeOnNavigation: true,
        });

        this._dialogRef.afterClosed().subscribe(() => {
          this._loadingIndicatorService.stop();
        });

        this._subscription.add(this._onVerified());
        this._subscription.add(this._onDismissed());
      });
  }
}
