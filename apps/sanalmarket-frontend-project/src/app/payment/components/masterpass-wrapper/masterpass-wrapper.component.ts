import {
  AfterContentInit,
  Component,
  EventEmitter,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

import { LazyScriptLoaderService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';
import { CardInfoService } from '@fe-commerce/line-payment-credit-card';
import { MasterpassService, MasterpassWrapperComponent } from '@fe-commerce/line-payment-masterpass';

import { CheckoutPaymentCreditCardFormBean } from '@migroscomtr/sanalmarket-angular';
import { Subscription } from 'rxjs';

import PaymentTypeEnum = CheckoutPaymentCreditCardFormBean.PaymentTypeEnum;

@Component({
  selector: 'sm-masterpass-wrapper',
  templateUrl: './masterpass-wrapper.component.html',
  styleUrls: ['./masterpass-wrapper.component.scss'],
})
export class SmMasterpassWrapperComponent
  extends MasterpassWrapperComponent
  implements OnInit, AfterContentInit, OnChanges, OnDestroy
{
  @Output() selectedPaymentChanged = new EventEmitter<PaymentTypeEnum>();

  constructor(
    _masterpassService: MasterpassService,
    _cardInfoService: CardInfoService,
    _lazyScriptLoaderService: LazyScriptLoaderService,
    _envService: EnvService
  ) {
    super(_masterpassService, _cardInfoService, _lazyScriptLoaderService, _envService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._subscription.add(this.subscribeToSelectedCard());
  }

  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  ngAfterContentInit(): void {
    super.ngAfterContentInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  getRegisterCandidateCardInfo(): CheckoutPaymentCreditCardFormBean {
    return this.registerCandidateCardInfo;
  }

  isCandidateCardValid(): boolean {
    return this.candidateValid;
  }

  subscribeToSelectedCard(): Subscription {
    return this._masterpassService.getSelectedCard().subscribe((card) => {
      if (card === null) {
        this.selectedPaymentChanged.emit('CREDIT_CARD');
      } else {
        this.selectedPaymentChanged.emit('MASTERPASS');
        this._cardInfoService.getCardInfo(this.checkoutId, { cardNumber: card.Value1 });
      }
    });
  }
}
