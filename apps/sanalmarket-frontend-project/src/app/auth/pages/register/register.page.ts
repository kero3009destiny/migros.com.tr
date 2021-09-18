import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { PhoneVerifyService } from '@fe-commerce/auth';
import {
  AgreementDialogComponent,
  AppStateService,
  GtmService,
  LoadingIndicatorService,
  UserService,
} from '@fe-commerce/core';
import { AgreementsType, OtpDialogDataModel } from '@fe-commerce/shared';

import { catchError, filter, finalize, map } from 'rxjs/operators';

import { faTimesCircle, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import { OtpRegistrationControllerV2Service, UserDTO } from '@migroscomtr/sanalmarket-angular';
import { Subscription, throwError } from 'rxjs';

import { OtpRegisterDialogComponent } from '../../../core';
import { ROUTE_HOME } from '../../../routes';

@Component({
  selector: 'sm-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit, OnDestroy {
  registerFormGroup: FormGroup;

  _isUserRegisteredSuccessfully = false;
  _subscription = new Subscription();
  clearIcon: IconDefinition = faTimesCircle;
  maskOptions = { mask: '\\0(500) 000-0000', lazy: false };

  constructor(
    private _registrationService: OtpRegistrationControllerV2Service,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _phoneVerifyService: PhoneVerifyService,
    private _userService: UserService,
    private _gtmService: GtmService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    public agreementDialog: MatDialog,
    private _appState: AppStateService
  ) {}

  ngOnInit(): void {
    this._buildRegisterForm();
    this._subscription.add(this._subscribeToUser());
    this._sendGtmPageViewEvent('Register');
    this._appState.setMobileBottomNavVisibility(false);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._appState.setMobileBottomNavVisibility(true);
  }

  getEmail(): AbstractControl {
    return this.registerFormGroup.get('email');
  }
  getPhoneNumber(): AbstractControl {
    return this.registerFormGroup.get('phoneNumber');
  }
  getPermitMembership(): AbstractControl {
    return this.registerFormGroup.get('permitMembership');
  }

  getPermitContact(): AbstractControl {
    return this.registerFormGroup.get('permitContact');
  }

  getUserAgreement(): AbstractControl {
    return this.registerFormGroup.get('userAgreement');
  }

  onRegister(): void {
    const { email, permitMembership, permitContact } = this.registerFormGroup.value;
    const phoneNumber = `5${this.registerFormGroup.value.phoneNumber}`;

    this._loadingIndicatorService.start();

    this._registrationService
      .code1({ email, phoneNumber })
      .pipe(
        catchError((error) => {
          this._loadingIndicatorService.stop();
          this._isUserRegisteredSuccessfully = false;
          return throwError(error);
        }),
        filter((response) => response.successful),
        map((response) => response.data),
        map((data) => ({
          sendPhonePostData: {
            phoneNumber,
            email,
          },
          successNotificationConfig: {
            title: 'Hoş geldiniz!',
            message: 'Başarılı bir şekilde üye oldunuz.',
          },
          verifyPostData: {
            permitContact,
            permitKvk: permitMembership,
            ...data,
            tryAgainEnableInSeconds: data.phoneNumberClaimExpireInSeconds,
          },
        })),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((otpModalData: OtpDialogDataModel) => {
        this._phoneVerifyService.openVerifyModal(
          OtpRegisterDialogComponent,
          // we use try again enable as the only countdown for sm
          {
            ...otpModalData,
            verifyPostData: {
              ...otpModalData.verifyPostData,
              phoneNumberClaimExpireInSeconds: otpModalData.verifyPostData.phoneNumberClaimTryAgainEnableInSeconds,
              expireInSeconds: otpModalData.verifyPostData.tryAgainEnableInSeconds,
            },
          },
          this._onUserVerified.bind(this)
        );
      });
  }

  touchAllFields(): void {
    this.registerFormGroup.markAllAsTouched();
  }

  clear(field: string): void {
    this.registerFormGroup.get(field).setValue(null);
  }

  onAgreementClick(agreementType: AgreementsType): void {
    const dialogRef = this.agreementDialog.open(AgreementDialogComponent, {
      data: { type: agreementType },
      autoFocus: false,
    });
  }

  private _onUserVerified(isVerified: boolean): void {
    if (isVerified) {
      this._isUserRegisteredSuccessfully = true;
      this._userService.getUser();
    }
  }

  private _buildRegisterForm(): void {
    this.registerFormGroup = this._formBuilder.group({
      email: [
        null,
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^ığüşöçİĞÜŞÖÇ]+@[^ığüşöçİĞÜŞÖÇ]+\.[a-z-A-Z]{2,}$/),
        ],
      ],
      phoneNumber: [null, [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      permitMembership: [null, [Validators.requiredTrue]],
      permitContact: false,
    });
  }

  private _subscribeToUser(): Subscription {
    return this._userService.user$.subscribe((userInfo: UserDTO) => {
      if (userInfo.id && this._isUserRegisteredSuccessfully) {
        this._sendGtmEvent(userInfo);
        this._router.navigate([ROUTE_HOME]);
      }
    });
  }

  private _sendGtmEvent(user: UserDTO): void {
    this._gtmService.sendRegisterEvent({ event: 'register', userId: user.id });
  }

  private _sendGtmPageViewEvent(page: string): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Kayıt ol | Sanalmarket',
      virtualPageName: page,
      objectId: '',
    });
  }
}
