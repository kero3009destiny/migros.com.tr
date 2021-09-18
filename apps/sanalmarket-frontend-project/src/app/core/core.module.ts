import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { SharedModule } from '@fe-commerce/shared';

import { SharedModule as SmSharedModule } from '../shared';
import { RegistrationAgreementsFormControlComponent } from './components/registration-agreements-form/registration-agreements-form-control.component';
import {
  AnonymousLoginDialogComponent,
  OtpAnonymousRegisterDialogComponent,
  OtpDialogComponent,
  OtpLoginDialogComponent,
  OtpRecoveryDialogComponent,
  OtpRecoveryEmailDialogComponent,
  OtpRegisterDialogComponent,
  OtpUpdateEmailDialogComponent,
  OtpUpdatePhoneDialogComponent,
  OtpVerifyEmailDialogComponent,
  SmMasterpassOtpDialogComponent,
  SmMoneyPayOtpDialogComponent,
  SuccessDialogComponent,
} from './dialogs';

@NgModule({
  declarations: [
    AnonymousLoginDialogComponent,
    OtpDialogComponent,
    OtpLoginDialogComponent,
    OtpRegisterDialogComponent,
    OtpRecoveryDialogComponent,
    OtpAnonymousRegisterDialogComponent,
    OtpRecoveryEmailDialogComponent,
    SmMasterpassOtpDialogComponent,
    RegistrationAgreementsFormControlComponent,
    SuccessDialogComponent,
    OtpVerifyEmailDialogComponent,
    OtpUpdateEmailDialogComponent,
    OtpUpdatePhoneDialogComponent,
    SmMoneyPayOtpDialogComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, MdcComponentsModule, SharedModule, SmSharedModule, RouterModule],
  exports: [RegistrationAgreementsFormControlComponent, AnonymousLoginDialogComponent],
})
export class CoreModule {}
