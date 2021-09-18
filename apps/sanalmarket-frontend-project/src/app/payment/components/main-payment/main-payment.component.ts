import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { faDoorOpen } from '@fortawesome/pro-regular-svg-icons';
import { CheckoutDTO, CheckoutInfoDTO, CheckoutPaymentFormBean } from '@migroscomtr/sanalmarket-angular';

import { OnlineCreditCardComponent } from '../online-credit-card/online-credit-card.component';

type PaymentTypeEnum = CheckoutPaymentFormBean.PaymentTypeEnum;

@Component({
  selector: 'sm-main-payment',
  templateUrl: './main-payment.component.html',
  styleUrls: ['./main-payment.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPaymentComponent implements OnChanges {
  deliveryPaymentIcon = faDoorOpen;

  private _selectedPaymentMethod: PaymentTypeEnum;
  private _selectedRadio: string;
  private _closedPaymentTypes: PaymentTypeEnum[] = [];

  @Input() defaultPaymentMethod: PaymentTypeEnum;
  @Input() checkoutInfo: CheckoutInfoDTO;

  @Output() paymentMethodChanged = new EventEmitter<PaymentTypeEnum>();

  @ViewChild(OnlineCreditCardComponent) onlineCreditCardComponent: OnlineCreditCardComponent;

  readonly PAYMENT_ENUM = CheckoutPaymentFormBean.PaymentTypeEnum;

  readonly PAYMENT_RADIO_MAP: Partial<Record<PaymentTypeEnum, string>> = {
    CREDIT_CARD: 'CREDIT_CARD|MASTERPASS',
    MASTERPASS: 'CREDIT_CARD|MASTERPASS',
    BKM: 'BKM',
    GARANTI_PAY: 'GARANTI_PAY',
    WALLET: 'WALLET|LOAN',
    LOAN: 'WALLET|LOAN',
    CASH_ON_DELIVERY: 'CASH_ON_DELIVERY|CREDIT_CARD_ON_DELIVERY',
    CREDIT_CARD_ON_DELIVERY: 'CASH_ON_DELIVERY|CREDIT_CARD_ON_DELIVERY',
  };

  readonly RADIO_PAYMENT_MAP: Record<string, PaymentTypeEnum> = {
    'CREDIT_CARD|MASTERPASS': null,
    BKM: this.PAYMENT_ENUM.Bkm,
    GARANTI_PAY: this.PAYMENT_ENUM.GarantiPay,
    'WALLET|LOAN': null,
    'CASH_ON_DELIVERY|CREDIT_CARD_ON_DELIVERY': null,
  };

  ngOnChanges(changes: SimpleChanges) {
    const defaultPaymentMethodChange = changes.defaultPaymentMethod;
    if (defaultPaymentMethodChange?.firstChange && !!defaultPaymentMethodChange.currentValue) {
      this._selectedPaymentMethod = defaultPaymentMethodChange.currentValue;
      this._selectedRadio = this.PAYMENT_RADIO_MAP[this._selectedPaymentMethod];
    }
    const checkoutInfoChange = changes.checkoutInfo;
    if (!!checkoutInfoChange.currentValue) {
      const { line } = checkoutInfoChange.currentValue as CheckoutInfoDTO;
      this._closedPaymentTypes = this._extractClosedPaymentTypesFrom(line);
    }
  }

  getSelectedRadio(): string {
    return this._selectedRadio;
  }

  getClosedPayments(): PaymentTypeEnum[] {
    return this._closedPaymentTypes;
  }

  getOptionWrapperClass(paymentType: PaymentTypeEnum): { active: boolean } {
    return { active: this.isRadioSelected(this.PAYMENT_RADIO_MAP[paymentType]) };
  }

  getCheckoutId(): number | undefined {
    return this.checkoutInfo?.line?.id;
  }
  //todo: wrapperin icinde yap userdan cek
  getPhoneNumber(): string | undefined {
    return this.checkoutInfo?.line?.phoneNumber;
  }

  isRadioSelected(radio: string): boolean {
    return this._selectedRadio === radio;
  }

  arePaymentsClosed(payments: PaymentTypeEnum[]): boolean {
    return payments.every((payment) => this._closedPaymentTypes.includes(payment));
  }

  onSelectedRadioChange(radio: string): void {
    if (radio === undefined) {
      return;
    }
    this._selectedRadio = radio;
    const currentPayment = this.RADIO_PAYMENT_MAP[radio];
    this.onSelectedPaymentChange(currentPayment);
  }

  onSelectedPaymentChange(payment: PaymentTypeEnum, selectedRadio?: string): void {
    if (selectedRadio && selectedRadio !== this._selectedRadio) {
      return;
    }
    this._selectedPaymentMethod = payment;
    this.paymentMethodChanged.emit(payment);
  }

  private _extractClosedPaymentTypesFrom({
    closedPaymentTypes = '',
    disabledPaymentTypes = '',
  }: CheckoutDTO): PaymentTypeEnum[] {
    const closedPaymentTypeArray = closedPaymentTypes.split('|');
    const disabledPaymentTypeArray = disabledPaymentTypes.split('|');
    //@ts-expect-error string to enum conversion
    return [...closedPaymentTypeArray, ...disabledPaymentTypeArray];
  }
}
