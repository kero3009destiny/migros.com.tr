import { Component, DoCheck, forwardRef, Host, Input, OnDestroy, OnInit, Optional, SkipSelf } from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { AgreementDialogComponent } from '@fe-commerce/core';

import { Subscription } from 'rxjs';

import { AcceptAgreementRequest } from '@migroscomtr/sanalmarket-angular';
import AcceptedAgreementsEnum = AcceptAgreementRequest.AcceptedAgreementsEnum;

export interface RegisterAgreementsForm {
  permitMembership: boolean;
  permitContact: boolean;
}

@Component({
  selector: 'sm-register-agreements-form',
  templateUrl: './registration-agreements-form-control.component.html',
  styleUrls: ['./registration-agreements-form-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RegistrationAgreementsFormControlComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RegistrationAgreementsFormControlComponent),
      multi: true,
    },
  ],
})
export class RegistrationAgreementsFormControlComponent implements ControlValueAccessor, OnDestroy, OnInit, DoCheck {
  readonly personalDataAgreementKey = 'PERSONAL_DATA_AGREEMENT';
  readonly membershipAgreementKey = 'MEMBERSHIP_AGREEMENT';
  readonly explicitConsentKey = 'EXPLICIT_CONSENT_AGREEMENT';
  readonly kvkMembershipAgreementKey = 'KVK_MEMBERSHIP_AGREEMENT';

  registrationAgreementsForm: FormGroup;
  subscriptions: Subscription[] = [];

  @Input() formControlName: string;
  constructor(
    private formBuilder: FormBuilder,
    public agreementDialog: MatDialog,
    @Optional()
    @Host()
    @SkipSelf()
    private controlContainer: ControlContainer
  ) {}

  ngOnInit() {
    this.registrationAgreementsForm = this.formBuilder.group({
      permitMembership: [null, [Validators.requiredTrue]],
      permitContact: false,
    });

    this.subscriptions.push(
      this.registrationAgreementsForm.valueChanges.subscribe((value) => {
        this.onChange(value);
        this.onTouched();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  //solves: inner form control for registration agreements can't propagate touched to its child controls
  ngDoCheck() {
    if (this.controlContainer?.control) {
      const formControl = this.controlContainer.control.get(this.formControlName);
      if (formControl && formControl.touched) {
        this.registrationAgreementsForm.markAllAsTouched();
      }
    }
  }

  getValue(): RegisterAgreementsForm {
    return this.registrationAgreementsForm.value;
  }

  setValue(value: RegisterAgreementsForm): void {
    this.registrationAgreementsForm.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  onChange: any = () => undefined;
  onTouched: any = () => undefined;

  registerOnChange(onChangeFunction) {
    this.onChange = onChangeFunction;
  }

  writeValue(value) {
    if (value) {
      this.setValue(value);
    }

    if (value === null) {
      this.registrationAgreementsForm.reset();
    }
  }

  registerOnTouched(onTouchedFunction) {
    this.onTouched = onTouchedFunction;
  }

  validate(_: FormControl) {
    return this.registrationAgreementsForm.valid ? null : { registerAgreements: { valid: false } };
  }

  onAgreementClick(agreementType: AcceptedAgreementsEnum): void {
    this.agreementDialog.open(AgreementDialogComponent, {
      panelClass: 'wide-dialog',
      data: { type: agreementType },
      autoFocus: false,
    });
  }

  onClickPersonalDataAgreement(): void {
    this.onAgreementClick(this.personalDataAgreementKey);
  }

  onClickMembershipAgreement(): void {
    this.onAgreementClick(this.membershipAgreementKey);
  }

  onClickExplicitConsent(): void {
    this.onAgreementClick(this.explicitConsentKey);
  }

  onClickKvkMembershipAgreement(): void {
    this.onAgreementClick(this.kvkMembershipAgreementKey);
  }

  isPermitMembershipNotAccepted(): boolean {
    const permitMembership = this.registrationAgreementsForm?.get('permitMembership');
    return permitMembership?.invalid && permitMembership?.touched;
  }
}
