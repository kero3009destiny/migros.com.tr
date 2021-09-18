import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';

import { Observable } from 'rxjs';

import { faTimes, IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { faTimesCircle } from '@fortawesome/pro-solid-svg-icons';

import { SmOtpDialogComponentRefDirective, STEPS } from './otp-dialog.ref';

@Component({
  selector: 'sm-otp-dialog',
  templateUrl: './otp-dialog.component.html',
  styleUrls: ['./otp-dialog.component.scss'],
})
export class OtpDialogComponent extends SmOtpDialogComponentRefDirective implements AfterViewInit {
  faTimes: IconDefinition = faTimes;
  clearIcon: IconDefinition = faTimesCircle;

  @Input() currentStep;
  // TODO replace any
  @Input() onSendPhoneNumber: ({
    data,
    additionalData,
  }: {
    data: unknown;
    additionalData?: unknown;
  }) => Observable<any>;
  @Input() onVerifyPhoneNumber: ({
    data,
    additionalData,
  }: {
    data: unknown;
    additionalData?: unknown;
  }) => Observable<any>;
  @Input() onVerifyEmail: ({ data, additionalData }: { data: unknown; additionalData?: unknown }) => Observable<any>;
  @Input() onSendEmail: ({ data, additionalData }: { data: unknown; additionalData?: unknown }) => Observable<any>;
  @Input() onResendEmail: () => Observable<any>;

  ngAfterViewInit() {
    super.ngAfterViewInit();
    if (this.timerBar) {
      this.setCounterConfig();
      this.expireInSeconds = this.timerBar.countdown.ngxCountdownTimeout;
      this.startCountdown();
    }
  }

  sendPhoneNumber() {
    this.onSendPhoneNumber({
      data: this.data,
      additionalData: { phoneNumber: this.phoneNumberValue, email: this.emailValue },
    }).subscribe((data) => {
      this.data.verifyPostData = { ...this.data.verifyPostData, ...data };
      this.currentStep = STEPS.verify;
      if (this.timerBar) {
        this.setCounterConfig();
        this.startCountdown();
      }
    });
  }

  verifyPhoneNumber(code: string) {
    const { permitContact = false, permitKvk = false } = this.data?.verifyPostData;
    this.onVerifyPhoneNumber({
      data: this.data,
      additionalData: { code, permitContact, permitKvk },
    }).subscribe((response) => {
      const { successful, errorCode } = response;
      if (errorCode === '11021') {
        this.timerBar?.pause();
        this.currentStep = STEPS['accountNotFound'];
      }
      this.userVerified.emit(successful);
    });
  }

  verifyEmail() {
    const emailClaimToken = this.emailCode.value;
    this.onVerifyEmail({ data: this.data, additionalData: { emailClaimToken: this.emailCode.value } }).subscribe(
      (successful) => {
        if (successful) {
          this.data.verifyRecoveryEmailData = { ...this.data.verifyRecoveryEmailData, emailClaimToken };
          this.currentStep = STEPS.send;
        }
      }
    );
  }

  sendEmail() {
    this.onSendEmail({ data: this.data }).subscribe((data) => {
      this.data.verifyRecoveryEmailData = {
        ...this.data.verifyRecoveryEmailData,
        ...data,
      };
      if (this.timerBar) {
        this.setCounterConfig();
        this.startCountdown();
      }
    });
  }

  claimVerificationMail(code: string): void {
    this.onVerifyEmail({ data: this.data, additionalData: { code } }).subscribe((response) => {
      const { successful } = response;
      this.userVerified.emit(successful);
    });
  }

  resendEmail() {
    this.verifyEmailFormGroup.reset();
    this.resetCountDown();
    this.sendEmail();
  }

  get email() {
    return this.sendFormGroup.get('email');
  }

  get emailValue() {
    return (this.email ? this.email.value : null) || this.data.sendPhonePostData?.email;
  }

  clear(field: string) {
    this.verifyFormGroup.get(field).setValue(null);
  }
}
