import { AfterViewInit, Component, Input } from '@angular/core';

import { OtpResponseDataModel } from '@fe-commerce/shared';

import { filter, finalize } from 'rxjs/operators';

import { Observable } from 'rxjs';
import {
  AppResponse,
  ClaimInfoDTO,
  ServiceResponsestring,
  ServiceResponseUserDTO,
} from '@migroscomtr/sanalmarket-angular';

import { OtpDialogComponentRefDirective, STEPS } from './otp-dialog.ref';

@Component({
  selector: 'fe-auth-otp-dialog',
  templateUrl: './otp-dialog.component.html',
  styleUrls: ['./otp-dialog.component.scss'],
})
export class OtpDialogComponent extends OtpDialogComponentRefDirective implements AfterViewInit {
  @Input() currentStep;
  @Input() onSendPhoneNumber: ({ data, additionalData }: OtpResponseDataModel) => Observable<any>;
  @Input() onVerifyPhoneNumber: ({
    data,
    additionalData,
  }: OtpResponseDataModel) => Observable<ServiceResponseUserDTO & ServiceResponsestring>;
  @Input() onVerifyEmail: ({ data, additionalData }: OtpResponseDataModel) => Observable<AppResponse>;
  @Input() onSendEmail: ({ data, additionalData }: OtpResponseDataModel) => Observable<ClaimInfoDTO>;
  @Input() onResendEmail: () => Observable<unknown>;

  ngAfterViewInit() {
    super.ngAfterViewInit();
    if (this.timerBar) {
      this.setCounterConfig();
      this.startCountdown();
    }
  }

  sendPhoneNumber(): void {
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

  verifyPhoneNumber(code: string): void {
    const { permitContact = false, permitKvk = false } = this.data.verifyPostData;
    this.onVerifyPhoneNumber({
      data: this.data,
      additionalData: { code, permitContact, permitKvk },
    }).subscribe((response: AppResponse) => {
      const { successful, errorCode } = response;
      if (errorCode === '11021') {
        this.timerBar?.pause();
        this.currentStep = STEPS['accountNotFound'];
      }

      this.userVerified.emit(successful);
    });
  }

  claimVerificationMail(code: string): void {
    this._loadingIndicatorService.start();
    this.onVerifyEmail({ data: this.data, additionalData: { code } })
      .pipe(
        filter((otpData: OtpResponseDataModel) => otpData.successful),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((otpData) => {
        const { successful } = otpData;
        this.userVerified.emit(successful);
      });
  }

  verifyEmail(): void {
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

  sendEmail(): void {
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

  resendEmail(): void {
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
}
