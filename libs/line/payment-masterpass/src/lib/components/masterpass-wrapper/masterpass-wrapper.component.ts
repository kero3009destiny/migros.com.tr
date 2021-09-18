import {
  AfterContentInit,
  Component,
  ContentChild,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

import { LazyScriptLoaderService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';
import { CardInfoService } from '@fe-commerce/line-payment-credit-card';

import { debounceTime, filter } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import { CheckoutPaymentCreditCardFormBean } from '@migroscomtr/sanalmarket-angular';

import { MasterPassClientInterface } from '../../models';
import { MasterpassService } from '../../services/masterpass.service';

declare const MFS: MasterPassClientInterface;

@Component({
  selector: 'fe-masterpass-wrapper',
  templateUrl: './masterpass-wrapper.component.html',
  styleUrls: ['./masterpass-wrapper.component.scss'],
})
export class MasterpassWrapperComponent implements OnInit, AfterContentInit, OnChanges, OnDestroy {
  @Input() checkoutId: number;
  @Input() disabled: boolean;

  @ContentChild(FormGroupDirective) cardForm: FormGroupDirective;

  registerCandidateCardInfo: CheckoutPaymentCreditCardFormBean;
  candidateValid: boolean;

  protected _subscription = new Subscription();

  constructor(
    protected _masterpassService: MasterpassService,
    protected _cardInfoService: CardInfoService,
    protected _lazyScriptLoaderService: LazyScriptLoaderService,
    protected _envService: EnvService
  ) {}

  ngOnInit() {
    if (!this.disabled) {
      this._lazyScriptLoaderService.load({ name: 'Masterpass', src: 'masterpass.js' }).subscribe(() => {
        MFS.setClientId(this._envService.masterpassClientId);
        MFS.setAddress(this._envService.masterpassEndpoint);
        this._masterpassService.onInit();
      });
    }
  }

  ngAfterContentInit() {
    this._subscription.add(this._formStatusSubscription());
    this._subscription.add(this._formValueSubscription());
    this._subscription.add(this._registerInputsSubscription());
  }

  private _formValueSubscription() {
    return this.cardForm.valueChanges.subscribe((registerCandidateCardInfo: CheckoutPaymentCreditCardFormBean) => {
      this.registerCandidateCardInfo = registerCandidateCardInfo;
    });
  }

  private _formStatusSubscription() {
    return this.cardForm.statusChanges
      .pipe(
        filter((status) => status === 'VALID'),
        debounceTime(500)
      )
      .subscribe(() => {
        this.candidateValid = true;
        this._cardInfoService.getCardInfo(this.checkoutId, this.cardForm.value);
      });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this._masterpassService.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.checkoutId?.currentValue !== changes.checkoutId?.previousValue) {
      this._masterpassService.updateCheckoutId(changes.checkoutId.currentValue);
    }
  }

  private _registerInputsSubscription() {
    return this._masterpassService
      .getRegisterInputs()
      .pipe(filter((inputs) => inputs.length === 0))
      .subscribe(() => {
        this.cardForm.resetForm({ secure: false });
      });
  }
}
