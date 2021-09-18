import { BkmTokenFormBean } from '@migroscomtr/sanalmarket-angular';
import PaymentTypeEnum = BkmTokenFormBean.PaymentTypeEnum;

export enum MoneyPayAccountStatus {
  NOT_FETCHED = 'NOT_FETCHED',
  NOT_REGISTERED = 'NOT_REGISTERED',
  NOT_OTP_VERIFIED = 'NOT_OTP_VERIFIED',
  VERIFIED = 'VERIFIED',
}

export interface MoneyPayWalletStatus {
  walletBalance: number;
  walletAvailable: boolean;
  walletInsufficient?: boolean;
  walletDisableDesc?: string;
  alternativePayments: Array<PaymentStatusDTO>;
}

export interface PaymentStatusDTO {
  paymentType: PaymentTypeEnum;
  available: boolean;
  balance: number;
  insufficient?: boolean;
  disableDesc?: string;
}
