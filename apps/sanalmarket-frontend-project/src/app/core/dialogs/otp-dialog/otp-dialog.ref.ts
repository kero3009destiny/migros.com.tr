import { BreakpointObserver } from '@angular/cdk/layout';
import { Directive, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { LoadingIndicatorService, OtpDialogComponentRefDirective, UserService } from '@fe-commerce/core';
import { OtpDialogDataModel, TimerModel } from '@fe-commerce/shared';

import {
  OtpAuthenticationControllerService,
  OtpRegistrationControllerV2Service,
  UserRestControllerService,
} from '@migroscomtr/sanalmarket-angular';

export const STEPS = {
  send: {
    title: 'Telefonunu Doğrula',
    name: 'send',
  },
  verify: {
    title: 'Telefonunu Doğrula',
    name: 'verify',
  },
  verifyEmail: {
    title: 'Email Adresini Doğrula',
    name: 'verify-email',
  },
  verifyMembershipEmail: {
    title: 'E-posta Adresini Doğrula',
    name: 'verify-membership-email',
  },
  accountNotFound: {
    title: 'Hesap Bulunamadı!',
    name: 'accountNotFound',
  },
};

@Directive()
export abstract class SmOtpDialogComponentRefDirective extends OtpDialogComponentRefDirective {
  constructor(
    _registrationService: OtpRegistrationControllerV2Service,
    _authenticationService: OtpAuthenticationControllerService,
    _formBuilder: FormBuilder,
    _userService: UserService,
    dialogRef: MatDialogRef<SmOtpDialogComponentRefDirective>,
    breakpointObserver: BreakpointObserver,
    _loadingIndicatorService: LoadingIndicatorService,
    _userRestController: UserRestControllerService,
    _router: Router,
    @Inject(MAT_DIALOG_DATA) public data: OtpDialogDataModel
  ) {
    super(
      _registrationService,
      _authenticationService,
      _formBuilder,
      _userService,
      dialogRef,
      breakpointObserver,
      _loadingIndicatorService,
      _userRestController,
      _router,
      data
    );
  }

  onCountdownTicToc(event: TimerModel) {
    if (event.stepTimer === this.countDownTime && event.state !== 'PAUSED') {
      this.timerBar.pause();
    }
  }
}
