import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faWallet } from '@fortawesome/pro-light-svg-icons';
import { MoneyPayPaymentFormBean } from '@migroscomtr/sanalmarket-angular';

import { MoneyPayWalletStatus, PaymentStatusDTO } from '../../models';
import PaymentTypeEnum = MoneyPayPaymentFormBean.PaymentTypeEnum;

@Component({
  selector: 'fe-money-pay-options',
  templateUrl: './money-pay-options.component.html',
  styleUrls: ['./money-pay-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneyPayOptionsComponent {
  private walletIcon: IconProp = faWallet;
  private _selectedPaymentOption: string;

  @Input() walletStatus: MoneyPayWalletStatus;

  @Input() closedPayments: PaymentTypeEnum[] = [];
  @Output() selectedPaymentMethod = new EventEmitter<PaymentTypeEnum>();

  getWalletIcon(): IconProp {
    return this.walletIcon;
  }

  isWalletAvailable(): boolean {
    return !this.closedPayments.includes(PaymentTypeEnum.Wallet);
  }

  isAlternativeWalletOptionAvailable(walletOption): boolean {
    return !this.closedPayments.includes(walletOption) && walletOption.available;
  }

  getWalletBalance() {
    return this.walletStatus.walletBalance;
  }

  getAlternativeWalletOptions(): PaymentStatusDTO[] {
    return this.walletStatus.alternativePayments;
  }

  isWalletBalanceInsufficient(): boolean {
    return this.walletStatus.walletInsufficient;
  }

  onSelectedRadioChange(radio: string): void {
    if (radio === undefined) {
      return;
    }
    this._selectedPaymentOption = radio;
    const paymentTypeEnum = Object.keys(PaymentTypeEnum).find((key) => PaymentTypeEnum[key] === radio);
    this.selectedPaymentMethod.emit(PaymentTypeEnum[paymentTypeEnum]);
  }

  getWalletOptionName(): string {
    return PaymentTypeEnum.Wallet;
  }

  getPaymentOptionName(paymentOption: PaymentStatusDTO): string {
    return paymentOption.paymentType;
  }

  onAddMoneyButtonClicked(): void {
    window.open('https://www.moneypay.com.tr/download.html');
  }

  isAlternativePaymentOptionDisabled(alternativeWalletOption: PaymentStatusDTO): boolean {
    return !(alternativeWalletOption?.available ?? false);
  }

  isAlternativePaymentOptionClosed(alternativeWalletOption: PaymentStatusDTO): boolean {
    return this.closedPayments.includes(alternativeWalletOption.paymentType);
  }

  isAlternativePaymentBalanceInsufficient(alternativeWalletOption: PaymentStatusDTO): boolean {
    return alternativeWalletOption.insufficient;
  }

  isWalletDisabled(): boolean {
    return this.isWalletBalanceInsufficient();
  }

  isWalletDisabledInfoShown(): boolean {
    return this.isWalletBalanceInsufficient() || this.hasWalletDisabledInfoFromBackend();
  }

  private hasWalletDisabledInfoFromBackend(): boolean {
    return !this.walletStatus.walletAvailable && !!this.walletStatus.walletDisableDesc;
  }

  getWalletDisabledInfo(): string {
    return this.hasWalletDisabledInfoFromBackend()
      ? this.walletStatus.walletDisableDesc
      : this.isWalletBalanceInsufficient()
      ? 'Cüzdan bakiyeniz hesap tutarının altında.'
      : 'Ödeme seçeneği kullanılamıyor';
  }

  getAlternativePaymentOptionDisabledInfo(alternativeWalletOption: PaymentStatusDTO) {
    return alternativeWalletOption.disableDesc
      ? alternativeWalletOption.disableDesc
      : this.isAlternativePaymentBalanceInsufficient(alternativeWalletOption)
      ? 'Limitiniz ödeme tutarının altında.'
      : 'Ödeme seçeneği kullanılamıyor';
  }
}
