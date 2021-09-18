import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material-experimental/mdc-dialog';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { OtpDialogDataModel } from '@fe-commerce/shared';

import { filter } from 'rxjs/operators';

import { Subscription } from 'rxjs';

import { MasterpassOtpModalComponent } from '../../components/masterpass-otp-modal/masterpass-otp-modal.component';
import { ValidationStatus } from '../../models';

import { MasterpassStateService } from './masterpass-state.service';

const INITIAL_VERIFY_DATA: OtpDialogDataModel = {
  sendPhonePostData: {},
  successNotificationConfig: {
    title: 'SMS Doğrulama',
    message: 'Cep telefonu numaranız doğrulandı.',
  },
  verifyPostData: {},
};

export const TITLE_MAP = {
  [ValidationStatus.BANK_VALIDATION]: 'Banka Doğrulama Adımı',
  [ValidationStatus.MP_VALIDATION]: 'Masterpass Doğrulama Adımı',
};

@Injectable()
export class MasterpassOtpService implements OnDestroy {
  protected _dialogRef: MatDialogRef<MasterpassOtpModalComponent>;
  protected _subscription = new Subscription();

  constructor(
    protected _otpFormDialog: MatDialog,
    protected _masterpassStateService: MasterpassStateService,
    protected _loadingIndicatorService: LoadingIndicatorService
  ) {
    this._subscription.add(this._openModal());
    this._subscription.add(this._closeModal());
  }

  protected _openModal(): Subscription {
    return this._masterpassStateService
      .getValidationStatus()
      .pipe(
        filter((status) => status === ValidationStatus.BANK_VALIDATION || status === ValidationStatus.MP_VALIDATION)
      )
      .subscribe((status) => {
        if (this._dialogRef) {
          this._dialogRef.close();
        }
        this._dialogRef = this._otpFormDialog.open(MasterpassOtpModalComponent, {
          disableClose: true,
          panelClass: 'wide-dialog',
          data: {
            ...INITIAL_VERIFY_DATA,
            verifyPostData: {
              title: TITLE_MAP[status],
            },
          },
        });

        this._dialogRef.afterClosed().subscribe(() => {
          this._loadingIndicatorService.stop();
        });

        this._subscription.add(this._onVerified());
        this._subscription.add(this._onDismissed());
      });
  }

  protected _onVerified(): Subscription {
    return this._dialogRef.componentInstance.userVerified.subscribe((validationInputs) => {
      if (typeof validationInputs !== 'boolean') this._masterpassStateService.setValidationInputs(validationInputs);
    });
  }

  protected _onDismissed(): Subscription {
    return this._dialogRef.componentInstance.modalDismissed.subscribe(() => {
      this._masterpassStateService.setValidationStatus(ValidationStatus.UNSUCCESSFUL);
    });
  }

  protected _closeModal(): Subscription {
    return this._masterpassStateService
      .getValidationStatus()
      .pipe(
        filter((status) => status !== ValidationStatus.BANK_VALIDATION),
        filter((status) => status !== ValidationStatus.MP_VALIDATION),
        filter(() => !!this._dialogRef)
      )
      .subscribe(() => {
        this._dialogRef.close();
      });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
