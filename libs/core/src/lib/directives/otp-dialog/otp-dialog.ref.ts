import { BreakpointObserver } from '@angular/cdk/layout';
import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import {
  BreakpointObserverRef,
  CountdownTimerRefDirective,
  OtpDialogDataModel,
  TimerModel,
  VerifyPostData,
} from '@fe-commerce/shared';

import { Subscription } from 'rxjs';
import {
  OtpAuthenticationControllerService,
  OtpRegistrationControllerV2Service,
  UserDTO,
  UserRestControllerService,
} from '@migroscomtr/sanalmarket-angular';

import { LoadingIndicatorService, UserService } from '../../services';

export const STEPS = {
  send: {
    title: 'Telefon Numaranızı Doğrulayın',
    name: 'send',
  },
  verify: {
    title: 'Telefon Numaranızı Doğrulayın',
    name: 'verify',
  },
  verifyEmail: {
    title: 'Email Adresinizi Doğrulayın',
    name: 'verify-email',
  },
  verifyMembershipEmail: {
    title: 'E-posta Adresinizi Doğrulayın',
    name: 'verify-membership-email',
  },
  accountNotFound: {
    title: 'Hesap Bulunamadı!',
    name: 'accountNotFound',
  },
  verifyPhone: {
    title: 'Telefon Doğrulama Adımı',
    name: 'verify-phone',
  },
};

@Directive()
export abstract class OtpDialogComponentRefDirective
  extends BreakpointObserverRef
  implements OnInit, OnDestroy, AfterViewInit {
  user: UserDTO;
  verifyPostData: VerifyPostData;
  verifyFormGroup: FormGroup;
  sendFormGroup: FormGroup;
  verifyEmailFormGroup: FormGroup;
  sendEmailFormGroup: FormGroup;
  currentStep = STEPS['send'];
  expireInSeconds = 120;
  tryAgainEnableInSeconds = 60; // This value will be overridden with dialog data
  verifySubscription: Subscription;
  sendSubscription: Subscription;

  @Output() userVerified = new EventEmitter<HTMLInputElement[] | boolean>();
  @ViewChildren('timerBar') timerBars: QueryList<CountdownTimerRefDirective>;
  timerBar: CountdownTimerRefDirective;

  constructor(
    public _registrationService: OtpRegistrationControllerV2Service,
    public _authenticationService: OtpAuthenticationControllerService,
    public _formBuilder: FormBuilder,
    public _userService: UserService,
    public dialogRef: MatDialogRef<OtpDialogComponentRefDirective>,
    public breakpointObserver: BreakpointObserver,
    public _loadingIndicatorService: LoadingIndicatorService,
    public _userRestController: UserRestControllerService,
    private _router: Router,
    @Inject(MAT_DIALOG_DATA) public data: OtpDialogDataModel
  ) {
    super(breakpointObserver);
  }

  ngOnInit() {
    this.subscribeToUser();
    this.buildVerifyForm();
    this.buildSendForm();
    this.buildVerifyEmailForm();
    this.buildSendEmailForm();
    super.ngOnInit();
  }

  ngAfterViewInit() {
    this.timerBar = this.timerBars.first;
    this.timerBars.changes.subscribe((components: QueryList<CountdownTimerRefDirective>) => {
      this.timerBar = components.first;
      if (this.timerBar) {
        this.setCounterConfig();
        this.startCountdown();
      }
    });
  }

  ngOnDestroy() {
    if (this.sendSubscription) {
      this.sendSubscription.unsubscribe();
    }
    if (this.verifySubscription) {
      this.verifySubscription.unsubscribe();
    }
  }

  get code() {
    return this.verifyFormGroup.get('code');
  }

  get phoneNumber() {
    return this.sendFormGroup.get('phoneNumber');
  }

  get countDownTime() {
    return this.expireInSeconds;
  }

  set countDownTime(time) {
    this.expireInSeconds = time;
  }

  get phoneNumberValue() {
    return (this.phoneNumber ? this.phoneNumber.value : null) || this.data.sendPhonePostData?.phoneNumber;
  }

  get email() {
    return this.sendEmailFormGroup.get('email').value;
  }

  get emailCode() {
    return this.verifyEmailFormGroup.get('code');
  }

  setCounterConfig() {
    const mergedData = { ...this.data.verifyPostData, ...this.data.verifyRecoveryEmailData };

    const {
      phoneNumberClaimExpireInSeconds,
      phoneNumberClaimTryAgainEnableInSeconds,
      expireInSeconds,
      tryAgainEnableInSeconds,
    } = mergedData;

    this.tryAgainEnableInSeconds = tryAgainEnableInSeconds || phoneNumberClaimTryAgainEnableInSeconds;
    this.countDownTime = expireInSeconds || phoneNumberClaimExpireInSeconds;
  }

  subscribeToUser() {
    this._userService.user$.subscribe((userData) => {
      this.user = userData;
    });
  }

  sendPhoneNumber(): void {
    // Will be override
  }

  verifyPhoneNumber(code: string): void {
    // Will be override
  }

  buildVerifyForm() {
    const phoneNumber =
      this.data.verifyPostData?.phoneNumber ||
      this.user.phoneNumber ||
      this.data.verifyRecoveryEmailData?.phoneNumber ||
      null;

    this.sendFormGroup = this._formBuilder.group({
      phoneNumber: [phoneNumber, [Validators.required, Validators.pattern(/^5{1}[0-9]{9}$/)]],
    });
  }

  buildVerifyEmailForm() {
    this.verifyEmailFormGroup = this._formBuilder.group({
      code: [null, [Validators.required, Validators.pattern(/[0-9]{6}$/)]],
    });
  }

  buildSendEmailForm() {
    const email = this.data.verifyRecoveryEmailData?.email || null;

    this.sendEmailFormGroup = this._formBuilder.group({
      email: [email, [Validators.required, Validators.email]],
    });
  }

  buildSendForm() {
    this.verifyFormGroup = this._formBuilder.group({
      code: [null, [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    });
  }

  startCountdown() {
    this.timerBar?.play();
  }

  resetCountDown() {
    this.timerBar.reset();
  }

  reSendSMSCode() {
    this.sendPhoneNumber();
  }

  onCountdownTicToc(event: TimerModel) {
    if (event.stepTimer === this.countDownTime && event.state !== 'PAUSED') {
      this.timerBar.pause();
      this.dialogRef.close();
    }
  }

  onRetry() {
    this.resetForm();
    this.resetCountDown();
    this.reSendSMSCode();
  }

  resetForm() {
    this.verifyFormGroup.reset();
  }

  dismissDialog() {
    this._router.navigate(['']);
    this.dialogRef.close();
  }
}
