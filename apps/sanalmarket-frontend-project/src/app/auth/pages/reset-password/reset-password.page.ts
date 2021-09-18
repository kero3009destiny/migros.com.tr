import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { PhoneVerifyService } from '@fe-commerce/auth';
import { GtmService, LoadingIndicatorService, UserService } from '@fe-commerce/core';
import { HttpResponseModel, OtpDialogDataModel, ToasterService } from '@fe-commerce/shared';

import { Subscription, throwError } from 'rxjs';
import { catchError, filter, finalize, map } from 'rxjs/operators';

import { faTimesCircle, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import { UserRestControllerService } from '@migroscomtr/sanalmarket-angular';

import { OtpRecoveryDialogComponent } from '../../../core';

interface HttpRecoveryMailQueryModel {
  token: string;
  id: string;
  ['claim-id']: string;
  email: string;
  code: string;
}

@Component({
  selector: 'sm-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit, OnDestroy {
  recoveryAccountFormGroup: FormGroup;
  recoveryQueryParams: HttpRecoveryMailQueryModel;
  readonly REQUIRED_FIELDS = ['email', 'id', 'claim-id', 'token', 'code'];
  private _isUserResetPasswordSuccessfully = false;
  private _userSubscription: Subscription;
  private _routerSubscription: Subscription;

  private _subscriptions = [];
  clearIcon: IconDefinition = faTimesCircle;

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _phoneVerifyService: PhoneVerifyService,
    private _gtmService: GtmService,
    private _toasterService: ToasterService,
    private _userService: UserService,
    private _userRestController: UserRestControllerService
  ) {}

  ngOnInit() {
    this.buildRecoveryAccountForm();
    this.subscribeToRouter();
    this.subscribeToUser();
    this.sendGtmPageViewEvent('ResetPassword');
  }

  ngOnDestroy() {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  get phoneNumber() {
    return this.recoveryAccountFormGroup.get('phoneNumber');
  }

  subscribeToRouter() {
    this._routerSubscription = this._activatedRoute.queryParams.subscribe((params: Params) => {
      this.recoveryQueryParams = params as HttpRecoveryMailQueryModel;
      this.checkQueryParams();
      this.verifyMail();
    });

    this._subscriptions.push(this._routerSubscription);
  }

  checkQueryParams() {
    const isAllQueryParamsProvided = this.REQUIRED_FIELDS.every((item) => this.recoveryQueryParams[item] !== undefined);
    if (!isAllQueryParamsProvided) {
      this._loadingIndicatorService.stop();
      this._router.navigate(['/']);
    }
  }

  onRecoverySubmit() {
    const { token } = this.recoveryQueryParams;
    const emailClaimId = this.recoveryQueryParams['claim-id'];
    const phoneNumber = this.phoneNumber.value;
    this._loadingIndicatorService.start();

    this._userRestController
      .sendOtpForRecovery({
        phoneNumber,
        emailClaimId,
        emailClaimToken: token,
      })
      .pipe(
        catchError((error) => {
          this._loadingIndicatorService.stop();
          this._isUserResetPasswordSuccessfully = false;
          return throwError(error);
        }),
        map((response: HttpResponseModel) => response.data),
        map((data) => {
          return {
            sendPhonePostData: {
              phoneNumber,
              emailClaimId,
              emailClaimToken: token,
            },
            successNotificationConfig: {
              title: 'Hoş geldiniz!',
              message: 'Başarılı bir şekilde hesabınıza giriş yaptınız.',
            },
            verifyPostData: {
              ...data,
            },
          } as OtpDialogDataModel;
        }),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((otpModalData) => {
        this._phoneVerifyService.openVerifyModal(
          OtpRecoveryDialogComponent,
          otpModalData,
          this.onUserVerified.bind(this)
        );
      });
  }

  verifyMail() {
    const { token } = this.recoveryQueryParams;
    const emailClaimId = this.recoveryQueryParams['claim-id'];
    this._loadingIndicatorService.start();
    this._userRestController
      .verifyRecoveryMail({
        emailClaimId,
        emailClaimToken: token,
      })
      .pipe(
        catchError((error) => {
          this._loadingIndicatorService.stop();
          const { errorDetail, errorTitle } = error.error;
          this.showVerifyError({ errorDetail, errorTitle });

          this._router.navigate(['/']);
          return throwError(error);
        }),
        map((response: HttpResponseModel) => response.data),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe();
  }

  onUserVerified(isVerified) {
    if (isVerified) {
      this._isUserResetPasswordSuccessfully = true;
      this._userService.getUser();
    }
  }

  buildRecoveryAccountForm() {
    this.recoveryAccountFormGroup = this._formBuilder.group({
      phoneNumber: [null, [Validators.required, Validators.pattern(/^5{1}[0-9]{9}$/)]],
    });
  }

  showVerifyError({ errorDetail, errorTitle }) {
    this._toasterService.showToaster({
      settings: {
        state: 'danger',
      },
      data: {
        title: errorTitle || 'İşlem başarısız!',
        message: errorDetail || 'Lütfen tekrar deneyiniz',
      },
    });
  }

  subscribeToUser() {
    this._userSubscription = this._userService.user$
      .pipe(filter((userInfo) => !!userInfo.id && this._isUserResetPasswordSuccessfully))
      .subscribe((_) => this._router.navigate(['/']));

    this._subscriptions.push(this._userSubscription);
  }

  sendGtmPageViewEvent(page) {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Hesap kurtar | Sanalmarket',
      virtualPageName: page,
      objectId: '',
    });
  }

  clear(field: string) {
    this.recoveryAccountFormGroup.get(field).setValue(null);
  }
}
