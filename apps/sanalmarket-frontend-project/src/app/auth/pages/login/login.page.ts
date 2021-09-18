import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { PhoneVerifyService } from '@fe-commerce/auth';
import { AppStateService, GtmService, LoadingIndicatorService, UserService } from '@fe-commerce/core';
import { CookieSettingsService } from '@fe-commerce/product';
import { HttpResponseModel, OtpDialogDataModel } from '@fe-commerce/shared';

import { catchError, filter, finalize, map } from 'rxjs/operators';

import { faTimesCircle, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import { FaqDTO, FaqRestControllerService, OtpAuthenticationControllerService } from '@migroscomtr/sanalmarket-angular';
import { Subscription, throwError } from 'rxjs';

import { OtpLoginDialogComponent } from '../../../core';
import { ROUTE_HOME } from '../../../routes';

@Component({
  selector: 'sm-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  loginFormGroup: FormGroup;
  faqs: FaqDTO[];
  isFaqsOpened = false;
  clearIcon: IconDefinition = faTimesCircle;
  maskOptions = { mask: '\\0(500) 000-0000', lazy: false };

  private _isUserLoggedInSuccessfully: boolean;
  private _loginSubscription: Subscription;
  private _userSubscription: Subscription;

  constructor(
    private _phoneVerifyService: PhoneVerifyService,
    public dialog: MatDialog,
    private _authenticationService: OtpAuthenticationControllerService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _gtmService: GtmService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _faqRestController: FaqRestControllerService,
    private _appState: AppStateService,
    private _cookieSettingsService: CookieSettingsService
  ) {}

  getPhoneNumber(): AbstractControl {
    return this.loginFormGroup.get('phoneNumber');
  }

  ngOnInit(): void {
    this.buildLoginForm();
    this.subscribeToUser();
    this.sendGtmPageViewEvent('Login');
    this._appState.setMobileBottomNavVisibility(false);
  }

  onLoginSubmit(): void {
    const phoneNumber = `5${this.loginFormGroup.value.phoneNumber}`;
    const rememberMe = this.loginFormGroup.value.rememberMe;
    this._loadingIndicatorService.start();

    this._loginSubscription = this._authenticationService
      .code({ phoneNumber })
      .pipe(
        catchError((error) => {
          this._loadingIndicatorService.stop();
          this._isUserLoggedInSuccessfully = false;
          return throwError(error);
        }),
        filter((response) => response.successful),
        map((response: HttpResponseModel) => response.data),
        map((data) => {
          return {
            sendPhonePostData: {
              phoneNumber,
            },
            successNotificationConfig: {
              title: 'Hoş geldiniz!',
              message: 'Başarılı bir şekilde giriş yaptınız.',
            },
            verifyPostData: {
              rememberMe,
              ...data,
              tryAgainEnableInSeconds: data.expireInSeconds,
            },
          } as OtpDialogDataModel;
        }),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((otpModalData) => {
        this._phoneVerifyService.openVerifyModal(
          OtpLoginDialogComponent,
          // we use try again enable as the only countdown for sm
          {
            ...otpModalData,
            verifyPostData: {
              ...otpModalData.verifyPostData,
              phoneNumberClaimExpireInSeconds: otpModalData.verifyPostData.phoneNumberClaimTryAgainEnableInSeconds,
              expireInSeconds: otpModalData.verifyPostData.tryAgainEnableInSeconds,
            },
          },
          this.onUserVerified.bind(this)
        );
      });
  }

  onUserVerified(isVerified: boolean): void {
    if (isVerified) {
      this._isUserLoggedInSuccessfully = true;
      this._loadingIndicatorService.start();
      this._userService.getUser();
    }
  }

  buildLoginForm(): void {
    this.loginFormGroup = this._formBuilder.group({
      phoneNumber: [null, [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      rememberMe: false,
    });
  }

  subscribeToUser(): void {
    this._userSubscription = this._userService.user$.subscribe((userInfo) => {
      if (userInfo.id && this._isUserLoggedInSuccessfully) {
        this._loadingIndicatorService.stop();
        this._router.navigate([ROUTE_HOME]);
      }
    });
  }

  sendGtmPageViewEvent(page: string): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Giriş | Sanalmarket',
      virtualPageName: page,
      objectId: '',
    });
  }

  showFaqs(): void {
    this._faqRestController
      .getOtpFaqs()
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.data)
      )
      .subscribe((data) => {
        this.faqs = data;
        this.isFaqsOpened = true;
      });
  }

  onCloseFaq(): void {
    this.isFaqsOpened = false;
  }

  ngOnDestroy(): void {
    if (this._loginSubscription) {
      this._loginSubscription.unsubscribe();
    }
    if (this._userSubscription) {
      this._userSubscription.unsubscribe();
    }
    this._appState.setMobileBottomNavVisibility(true);
  }

  clear(field: string): void {
    this.loginFormGroup.get(field).setValue(null);
  }
}
