import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { PhoneVerifyService } from '@fe-commerce/auth';
import { GtmService, LoadingIndicatorService, UserService } from '@fe-commerce/core';
import { getDate, OtpDialogDataModel, SubscriptionAbstract } from '@fe-commerce/shared';

import { finalize, takeUntil } from 'rxjs/operators';

import { Observable } from 'rxjs';
import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';
import { UserDTO } from '@migroscomtr/sanalmarket-angular';

import { OtpVerifyEmailDialogComponent } from '../../../core';

@Component({
  selector: 'sm-membership-information',
  templateUrl: './membership-information.page.html',
  styleUrls: ['./membership-information.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MembershipInformationPage extends SubscriptionAbstract implements OnInit {
  userInfo: UserDTO;
  basicInformationFormGroup: FormGroup;
  mainInformationFormGroup: FormGroup;
  permitFormGroup: FormGroup;

  checkIcon = faCheckCircle;
  moneyAdvantageImgPaths = [
    'migroskop.jpg',
    'kazan-harca.svg',
    'tam-bana-gore.jpg',
    'petrol-ofisi.jpg',
    'garantibbva.jpg',
  ];

  private informationChanged = false;
  private informationSaved = false;
  private permitChanged = false;
  private permitSaved = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _phoneVerifyService: PhoneVerifyService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _cdr: ChangeDetectorRef,
    private gtmService: GtmService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToUser();
    this.sendGtmPageViewEvent('MembershipInformation', 'Üyelik Bilgilerim | Sanal Market');
  }

  getUser$(): Observable<UserDTO> {
    return this._userService.user$;
  }

  isUserAuthenticated(): Observable<boolean> {
    return this._userService.isAuthenticated$;
  }

  isInformationChanged(): boolean {
    return this.informationChanged;
  }

  isInformationSaved(): boolean {
    return this.informationSaved;
  }

  isPermitChanged(): boolean {
    return this.permitChanged;
  }

  isPermitSaved(): boolean {
    return this.permitSaved;
  }

  subscribeToUser(): void {
    this.getUser$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((user: UserDTO) => {
        if (user.id) {
          this.userInfo = user;
          this.buildForm();
          this.setFormInitialValues(user);
          this.subscribeToFormValueChange();
          this.setInitialButtonStates();
        }
      });
  }

  setInitialButtonStates(): void {
    this.informationChanged = false;
    this.informationSaved = false;
    this.permitChanged = false;
    this.permitSaved = false;
  }

  setInformationChangeState(): void {
    this.informationChanged = true;
    this.informationSaved = false;

    if (!this.isPermitChanged()) {
      this.permitSaved = false;
    }
  }

  setInformationSaveState(): void {
    this.permitChanged = false;
    this.informationChanged = false;
    this.informationSaved = true;

    setTimeout(() => {
      this.informationSaved = false;
      this._cdr.markForCheck();
    }, 5000);
  }

  setPermitChangeState(): void {
    this.permitChanged = true;
    this.permitSaved = false;

    if (!this.isInformationChanged()) {
      this.informationSaved = false;
    }
  }

  setPermitSaveState(): void {
    this.informationChanged = false;
    this.permitChanged = false;
    this.permitSaved = true;

    setTimeout(() => {
      this.permitSaved = false;
      this._cdr.markForCheck();
    }, 5000);
  }

  subscribeToFormValueChange(): void {
    if (this.isCrmVerified()) {
      this.basicInformationFormGroup.valueChanges.pipe(takeUntil(this.getDestroyInterceptor())).subscribe(() => {
        this.setInformationChangeState();
      });
    }
    this.permitFormGroup.valueChanges.pipe(takeUntil(this.getDestroyInterceptor())).subscribe(() => {
      this.setPermitChangeState();
    });
  }

  isCrmVerified(): boolean {
    return this.userInfo.crmStatus === 'VERIFIED';
  }

  onInformationSave(): void {
    const { firstName, lastName, birthdate, gender } = this.basicInformationFormGroup.value;
    const correctedDate = getDate(birthdate.getTime());
    const userInfoData = { firstName, lastName, birthdate: correctedDate, gender };

    if (this.basicInformationFormGroup.valid) {
      this._loadingIndicatorService.start();

      this._userService
        .updatePersonalInformation({
          userInfoData,
          source: 'ACCOUNT_PAGE',
        })
        .pipe(
          takeUntil(this.getDestroyInterceptor()),
          finalize(() => this._loadingIndicatorService.stop())
        )
        .subscribe(() => {
          this.setInformationSaveState();
        });
    }
  }

  onPermitSave(): void {
    const permits = this.permitFormGroup.value;

    if (this.permitFormGroup.valid) {
      this._loadingIndicatorService.start();

      this._userService
        .updateContactInfo(permits)
        .pipe(
          takeUntil(this.getDestroyInterceptor()),
          finalize(() => this._loadingIndicatorService.stop())
        )
        .subscribe(() => {
          this.setPermitSaveState();
        });
    }
  }

  verifyEmail(): void {
    const email = this.mainInformationFormGroup.get('email').value;
    this._loadingIndicatorService.start();

    this._userService
      .sendVerificationMail(email)
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((data) => {
        const otpModalData: OtpDialogDataModel = {
          sendPhonePostData: {
            email,
          },
          verifyEmailData: {
            ...data,
          },
        };

        this._phoneVerifyService.openVerifyModal(
          OtpVerifyEmailDialogComponent,
          otpModalData,
          this.updateUser.bind(this)
        );
      });
  }

  updateUser(): void {
    this._userService.getUser();
  }

  setFormInitialValues(userInfo: UserDTO): void {
    if (this.isCrmVerified()) {
      this.mainInformationFormGroup.setValue({
        phoneNumber: userInfo.phoneNumber,
        email: userInfo.email,
      });
      this.basicInformationFormGroup.setValue({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        birthdate: getDate(+userInfo.birthdate),
        gender: userInfo.gender,
      });
      this.permitFormGroup.setValue({
        permitSms: userInfo.permitSms,
        permitCall: userInfo.permitCall,
        permitEmail: userInfo.permitEmail,
      });
    } else {
      this.mainInformationFormGroup.setValue({
        phoneNumber: userInfo.phoneNumber,
        email: userInfo.email,
      });
      this.permitFormGroup.setValue({
        permitSms: userInfo.permitSms,
        permitCall: userInfo.permitCall,
        permitEmail: userInfo.permitEmail,
      });
    }
  }

  private buildForm(): void {
    if (this.isCrmVerified()) {
      this.basicInformationFormGroup = this._formBuilder.group({
        firstName: [null, [Validators.required]],
        lastName: [null, [Validators.required]],
        birthdate: null,
        gender: null,
      });
    }
    this.mainInformationFormGroup = this._formBuilder.group({
      phoneNumber: [null, [Validators.required, Validators.pattern(/^5[0-9]{9}$/)]],
      email: [
        null,
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^ığüşöçİĞÜŞÖÇ]+@[^ığüşöçİĞÜŞÖÇ]+\.[a-z-A-Z]{2,}$/),
        ],
      ],
    });
    this.permitFormGroup = this._formBuilder.group({
      permitSms: false,
      permitCall: false,
      permitEmail: false,
    });
  }

  private sendGtmPageViewEvent(pageComponentName: string, pageTitle: string): void {
    this.gtmService.sendPageView({
      event: `virtualPageview${pageComponentName}`,
      virtualPagePath: this.router.url,
      virtualPageTitle: pageTitle,
      virtualPageName: pageComponentName,
    });
  }
}
