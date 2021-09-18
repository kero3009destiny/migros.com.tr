import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { LinePaymentMasterpassModule } from '@fe-commerce/line-payment-masterpass';
import { LinePaymentMoneypayModule, MoneypayOtpDialogService } from '@fe-commerce/line-payment-moneypay';
import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { SharedModule } from '@fe-commerce/shared';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  BkmComponent,
  GarantiPayComponent,
  PaymentOnDeliveryComponent,
  SmInstantDiscountComponent,
  SmMasterpassLinkUserComponent,
  SmMasterpassListCardsComponent,
  SmMasterpassRegisterComponent,
  SmMasterpassWrapperComponent,
} from './components';
import { MainPaymentComponent } from './components/main-payment/main-payment.component';
import { MasterpassConfirmDialogComponent } from './components/masterpass-card-list/masterpass-confirm-dialog/masterpass-confirm-dialog.component';
import { OnlineCreditCardComponent } from './components/online-credit-card/online-credit-card.component';
import { SidePaymentFormComponent } from './components/side-payment-form/side-payment-form.component';
import { SidePaymentPanelCouponComponent } from './components/side-payment-panel-coupon/side-payment-panel-coupon.component';
import { SidePaymentPanelCustomerBondComponent } from './components/side-payment-panel-customer-bond/side-payment-panel-customer-bond.component';
import { SidePaymentPanelMoneyComponent } from './components/side-payment-panel-money/side-payment-panel-money.component';
import { SidePaymentPanelPersonalBondComponent } from './components/side-payment-panel-personal-bond/side-payment-panel-personal-bond.component';
import { SidePaymentPanelVoucherComponent } from './components/side-payment-panel-voucher/side-payment-panel-voucher.component';
import { SidePaymentPanelComponent } from './components/side-payment-panel/side-payment-panel.component';
import { SidePaymentComponent } from './components/side-payment/side-payment.component';
import { SmMasterpassOtpService, SmMoneypayOtpDialogService } from './services';

@NgModule({
  declarations: [
    SidePaymentComponent,
    SidePaymentFormComponent,
    SidePaymentPanelComponent,
    SidePaymentPanelMoneyComponent,
    SidePaymentPanelPersonalBondComponent,
    SidePaymentPanelVoucherComponent,
    SidePaymentPanelCouponComponent,
    SidePaymentPanelCustomerBondComponent,
    //
    SmInstantDiscountComponent,
    //
    SmMasterpassListCardsComponent,
    SmMasterpassLinkUserComponent,
    SmMasterpassRegisterComponent,
    SmMasterpassWrapperComponent,
    MasterpassConfirmDialogComponent,
    //
    BkmComponent,
    OnlineCreditCardComponent,
    GarantiPayComponent,
    PaymentOnDeliveryComponent,
    MainPaymentComponent,
  ],
  imports: [
    CommonModule,
    MatExpansionModule,
    FontAwesomeModule,
    MatIconModule,
    MdcComponentsModule,
    ReactiveFormsModule,
    SharedModule,
    LinePaymentMasterpassModule.forRoot({ otpService: SmMasterpassOtpService }),
    LinePaymentMoneypayModule,
  ],
  exports: [
    BkmComponent,
    SmInstantDiscountComponent,
    SmMasterpassLinkUserComponent,
    SmMasterpassListCardsComponent,
    SmMasterpassRegisterComponent,
    SmMasterpassWrapperComponent,
    SidePaymentComponent,
    OnlineCreditCardComponent,
    GarantiPayComponent,
    PaymentOnDeliveryComponent,
    MainPaymentComponent,
  ],
  providers: [{ provide: MoneypayOtpDialogService, useClass: SmMoneypayOtpDialogService }],
})
export class PaymentModule {}
