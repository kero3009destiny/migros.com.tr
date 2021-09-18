import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';

import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons';
import { BkmTokenFormBean } from '@migroscomtr/sanalmarket-angular';
import PaymentTypeEnum = BkmTokenFormBean.PaymentTypeEnum;

@Component({
  selector: 'sm-payment-on-delivery',
  templateUrl: './payment-on-delivery.component.html',
  styleUrls: ['./payment-on-delivery.component.scss'],
})
export class PaymentOnDeliveryComponent {
  infoIcon = faInfoCircle;
  paymentType = '';

  @Input() closedPayments: PaymentTypeEnum[] = [];
  @Input() checkoutId: number;
  @Output() paymentChanged = new EventEmitter<'CASH_ON_DELIVERY' | 'CREDIT_CARD_ON_DELIVERY'>();

  onChangePaymentType(event: MatRadioChange): void {
    this.paymentType = event.value;
    this.paymentChanged.emit(event.value);
  }

  isSelected(type: string): boolean {
    return type === this.paymentType;
  }

  isCashDisabled(): boolean {
    return this.closedPayments.includes(PaymentTypeEnum.CashOnDelivery);
  }

  isCreditCardDisabled(): boolean {
    return this.closedPayments.includes(PaymentTypeEnum.CreditCardOnDelivery);
  }
}
