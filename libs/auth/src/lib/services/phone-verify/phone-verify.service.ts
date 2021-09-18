import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';

import { CompositeDialogService, OtpDialogComponent } from '@fe-commerce/core';
import { OtpDialogDataModel, ToasterService } from '@fe-commerce/shared';

import { BehaviorSubject } from 'rxjs';

import { UserDTO } from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class PhoneVerifyService {
  INITIAL_VERIFY_DATA: OtpDialogDataModel = {
    sendPhonePostData: {},
    successNotificationConfig: {
      title: 'SMS Doğrulama',
      message: 'Cep telefonu numaranız doğrulandı.',
    },
    verifyPostData: {},
  };
  user: UserDTO;
  private _userVerified: BehaviorSubject<boolean> = new BehaviorSubject(null);

  constructor(public _dialogService: CompositeDialogService, private _toasterService: ToasterService) {}

  get userVerified$() {
    return this._userVerified.asObservable();
  }

  openVerifyModal(
    relativeComponent?: ComponentType<any>,
    modalData: OtpDialogDataModel = this.INITIAL_VERIFY_DATA,
    onVerified?: Function,
    panelClass: string | Array<string> = 'wide-dialog'
  ) {
    const dialogRef = this._dialogService.dialog.open(relativeComponent || OtpDialogComponent, {
      panelClass: panelClass,
      data: modalData,
    });

    const userVerifiedSubscription = dialogRef.componentInstance.userVerified.subscribe((isVerified: boolean) => {
      if (onVerified) {
        onVerified(isVerified);
      }

      this.verifyUser(isVerified);
      if (isVerified) {
        dialogRef.close();

        if (modalData.successNotificationConfig) {
          this._toasterService.showToaster({
            data: modalData.successNotificationConfig,
            settings: {
              state: 'success',
            },
          });
        }
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      userVerifiedSubscription.unsubscribe();
    });
  }

  verifyUser(state: boolean) {
    this._userVerified.next(state);
  }
}
