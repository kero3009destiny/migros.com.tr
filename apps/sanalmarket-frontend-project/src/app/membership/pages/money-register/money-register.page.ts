import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { AgreementDialogComponent, LoadingIndicatorService, UserService } from '@fe-commerce/core';
import { AgreementsType, getDate, SubscriptionAbstract, ToasterService } from '@fe-commerce/shared';

import { finalize, takeUntil } from 'rxjs/operators';

import { Observable } from 'rxjs';
import { UserDTO } from '@migroscomtr/sanalmarket-angular';

import { SuccessDialogComponent } from '../../../core/dialogs';

@Component({
  selector: 'sm-money-register',
  templateUrl: './money-register.page.html',
  styleUrls: ['./money-register.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneyRegisterPage extends SubscriptionAbstract implements OnInit {
  userInfo: UserDTO;
  informationFormGroup: FormGroup;
  agreementsFormGroup: FormGroup;

  constructor(
    private _userService: UserService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _toasterService: ToasterService,
    public agreementDialog: MatDialog,
    public successDialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToUser();
  }

  getUser$(): Observable<UserDTO> {
    return this._userService.user$;
  }

  subscribeToUser(): void {
    this.getUser$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((user: UserDTO) => {
        this.userInfo = user;
        this.buildForm();
        this.setFormInitialValues(user);
        if (user.crmStatus === 'VERIFIED') {
          this._router.navigate(['/uyelik/bilgilerim']);
        }
      });
  }

  isButtonDisabled(): boolean {
    const { permitKvkk, permitMembership } = this.agreementsFormGroup.value;
    const isFormInvalid = !this.informationFormGroup.valid;
    return !permitKvkk || !permitMembership || isFormInvalid;
  }

  isUserAgeValid(birthdateMseconds: number): boolean {
    const minAge = 568080000000;
    const today = new Date().getTime();

    const currentAge = today - birthdateMseconds;

    return currentAge >= minAge;
  }

  onSubmit(): void {
    this._loadingIndicatorService.start();
    const { permitCrmContact } = this.agreementsFormGroup.value;
    const { firstName, lastName, gender } = this.informationFormGroup.value;
    const birthDate = this.informationFormGroup.value?.birthdate;
    const correctedDate = getDate(birthDate?.getTime());
    const userInfo = { firstName, lastName, birthdate: correctedDate, gender };

    if (this.isUserAgeValid(birthDate?.getTime())) {
      this._userService
        .updatePersonalInformation({
          userInfoData: { ...userInfo, permitCrmContact },
          source: 'ACCOUNT_PAGE',
          registerMcc: true,
        })
        .pipe(
          takeUntil(this.getDestroyInterceptor()),
          finalize(() => this._loadingIndicatorService.stop())
        )
        .subscribe(() => {
          this._loadingIndicatorService.stop();
          this.successDialog.open(SuccessDialogComponent, {
            panelClass: 'wide-dialog',
            data: { message: 'Money Üyeliğiniz Başarılı Bir Şekilde Oluşturuldu.' },
          });
        });
    } else {
      this._loadingIndicatorService.stop();
      this._toasterService.showToaster({
        settings: {
          state: 'danger',
        },
        data: {
          title: 'İşlem başarısız!',
          message: 'Üye olabilmek için 18 yaşından büyük olmanız gerekmektedir.',
        },
      });
    }
  }

  onAgreementClick(agreementType: AgreementsType): void {
    this.agreementDialog.open(AgreementDialogComponent, {
      data: { type: agreementType },
    });
  }

  setFormInitialValues(userInfo: UserDTO): void {
    this.informationFormGroup.setValue({
      phoneNumber: userInfo.phoneNumber,
      email: userInfo.email,
      firstName: null,
      lastName: null,
      birthdate: null,
      gender: null,
    });
  }

  private buildForm(): void {
    this.informationFormGroup = this._formBuilder.group({
      phoneNumber: null,
      email: null,
      firstName: [null, [Validators.required, Validators.pattern(/[a-zA-Z ]*/)]],
      lastName: [null, [Validators.required]],
      birthdate: [null, [Validators.required]],
      gender: [null, [Validators.required]],
    });
    this.agreementsFormGroup = this._formBuilder.group({
      permitCrmContact: false,
      permitKvkk: false,
      permitMembership: false,
    });
  }
}
