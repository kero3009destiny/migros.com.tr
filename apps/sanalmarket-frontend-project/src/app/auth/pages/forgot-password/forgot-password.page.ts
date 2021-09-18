import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { PhoneVerifyService } from '@fe-commerce/auth';
import { GtmService, LoadingIndicatorService, UserService } from '@fe-commerce/core';
import { HttpResponseModel, OtpDialogDataModel } from '@fe-commerce/shared';

import { catchError, filter, finalize, map } from 'rxjs/operators';

import { Subscription, throwError } from 'rxjs';
import { faArrowLeft, IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { faTimesCircle, faPhoneAlt } from '@fortawesome/pro-solid-svg-icons';
import { UserRestControllerService } from '@migroscomtr/sanalmarket-angular';

import { OtpRecoveryEmailDialogComponent } from '../../../core';

@Component({
  selector: 'sm-forgot-password-page',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit, OnDestroy {
  resetEmailFormGroup: FormGroup;
  phoneIcon: IconDefinition = faPhoneAlt;
  returnIcon: IconDefinition = faArrowLeft;
  clearIcon: IconDefinition = faTimesCircle;
  private _isUserRecoveredAccountSuccessfully = false;
  private _userSubscription: Subscription;

  constructor(
    private _formBuilder: FormBuilder,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _router: Router,
    private _gtmService: GtmService,
    private _phoneVerifyService: PhoneVerifyService,
    private _userService: UserService,
    private _userRestController: UserRestControllerService
  ) {}

  ngOnInit(): void {
    this.subscribeToUser();
    this.buildForgotPasswordForm();
    this.sendGtmPageViewEvent('ForgotPassword');
  }

  ngOnDestroy(): void {
    if (this._userSubscription) {
      this._userSubscription.unsubscribe();
    }
  }

  getEmail(): AbstractControl {
    return this.resetEmailFormGroup.get('email');
  }

  onResetPasswordMail(): void {
    const email = this.resetEmailFormGroup.value;
    this._loadingIndicatorService.start();

    this._userRestController
      .sendRecoveryMail(email)
      .pipe(
        catchError((error) => {
          this._loadingIndicatorService.stop();
          return throwError(error);
        }),
        filter((response) => response.successful),
        map((response: HttpResponseModel) => response.data),
        map((data) => {
          return {
            successNotificationConfig: {
              title: 'Hoş geldiniz!',
              message: 'Başarılı bir şekilde hesabınıza giriş yaptınız.',
            },
            verifyRecoveryEmailData: {
              ...data,
              tryAgainEnableInSeconds: data.expireInSeconds,
              email: data.objectId,
              emailClaimId: data.claimId,
            },
          } as OtpDialogDataModel;
        }),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((otpModalData: OtpDialogDataModel) => {
        this._phoneVerifyService.openVerifyModal(
          OtpRecoveryEmailDialogComponent,
          otpModalData,
          this.onUserVerified.bind(this),
          ['small-dialog', 'headerless']
        );
      });
  }

  subscribeToUser(): void {
    this._userSubscription = this._userService.user$
      .pipe(filter((userInfo) => !!userInfo.id && this._isUserRecoveredAccountSuccessfully))
      .subscribe((_) => this._router.navigate(['/']));
  }

  buildForgotPasswordForm(): void {
    this.resetEmailFormGroup = this._formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
    });
  }

  sendGtmPageViewEvent(page): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Şifremi Unuttum | Sanalmarket',
      virtualPageName: page,
      objectId: '',
    });
  }

  onUserVerified(isVerified): void {
    if (isVerified) {
      this._isUserRecoveredAccountSuccessfully = true;
      this._userService.getUser();
    }
  }

  clear(field: string): void {
    this.resetEmailFormGroup.get(field).setValue(null);
  }
}
