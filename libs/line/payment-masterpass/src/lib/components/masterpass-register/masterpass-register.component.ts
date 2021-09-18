import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { AgreementDialogComponent } from '@fe-commerce/core';

import { filter, map } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import { CheckoutPaymentCreditCardFormBean } from '@migroscomtr/sanalmarket-angular';

import { MasterpassService } from '../../services/masterpass.service';
import { extractInputsFromNodeList } from '../../utils';
import { UserStatus } from '../../models';
import { MasterpassStateService } from '../../services/internal';

@Component({
  selector: 'fe-masterpass-register',
  templateUrl: './masterpass-register.component.html',
  styleUrls: ['./masterpass-register.component.scss'],
})
export class MasterpassRegisterComponent implements OnInit, OnDestroy {
  isUserUpdateNeeded$ = this._masterpassService.getStatus().pipe(map((status) => status === UserStatus.UPDATE_NEEDED));

  private _agreements: string;
  private _subscription = new Subscription();

  registerAccepted = false;
  registerFormGroup: FormGroup;

  shouldShowAgreements = false;

  @Input() registerCandidateCardInfo?: CheckoutPaymentCreditCardFormBean;
  @Input() isCandidateCardValid: boolean;

  @ViewChild('registerCardForm') registerForm: ElementRef<HTMLFormElement>;

  constructor(
    public agreementDialog: MatDialog,
    protected _masterpassService: MasterpassService,
    protected _masterpassStateService: MasterpassStateService,
    protected _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.registerFormGroup = this._formBuilder.group({
      alias: [null, [Validators.required, Validators.maxLength(30)]],
    });
    this._subscription.add(this._agreementSubscription());
    this._subscription.add(this._registerInputsSubscription());
  }

  private _registerInputsSubscription(): void {
    this._masterpassService
      .getRegisterInputs()
      .pipe(filter((inputs) => inputs.length === 0))
      .subscribe(() => {
        this._resetForm();
      });
  }

  private _agreementSubscription(): Subscription {
    return this._masterpassService.getAgreements().subscribe((agreements) => (this._agreements = agreements));
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  get alias(): AbstractControl {
    return this.registerFormGroup.get('alias');
  }

  get registerCandidateCardYearLastTwoNumber(): number {
    return this.registerCandidateCardInfo?.expireYear % 100;
  }

  onCheckBoxChange(): void {
    this.registerAccepted = !this.registerAccepted;
  }

  onClickAgreementRequested(): void {
    this.agreementDialog.open(AgreementDialogComponent, {
      autoFocus: false,
      panelClass: 'wide-dialog',
      data: { html: this._agreements },
    });
  }

  onRegister(): void {
    const registerInputs = extractInputsFromNodeList(this.registerForm);
    this._masterpassService.register(registerInputs);
  }

  protected _resetForm(): void {
    this.registerAccepted = false;
    this.registerFormGroup.reset();
  }

  onLinkAccepted(): void {
    this._masterpassStateService.setStatus(UserStatus.UPDATE_APPROVED);
  }
}
