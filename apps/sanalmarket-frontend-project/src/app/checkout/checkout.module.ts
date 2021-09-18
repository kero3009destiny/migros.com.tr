import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { LineCheckoutModule } from '@fe-commerce/line-checkout';
import { LinePaymentCreditCardModule } from '@fe-commerce/line-payment-credit-card';
import { LineSharedModule } from '@fe-commerce/line-shared';
import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { SharedModule } from '@fe-commerce/shared';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CoreModule } from '../core';
import { PaymentModule } from '../payment/payment.module';
import { LayoutModule } from '../shared';

import { SmCheckoutRoutingModule } from './checkout-routing.module';
import {
  AddDeliveryAddressModalComponent,
  AddressSelectorComponent,
  AddInvoiceAddressModalComponent,
  CheckoutComponent,
  CompleteMembershipComponent,
  CorporateInvoiceAddressFormComponent,
  DeleteAddressModalComponent,
  DeliveryAddressCartSummaryComponent,
  DeliveryAddressFormComponent,
  MobileAgreementsDialogComponent,
  OrderSuccessApprovalComponent,
  OrderSummaryComponent,
} from './components';
import { AddDeliveryNoteComponent } from './components/add-delivery-note/add-delivery-note.component';
import { BagSelectorModalComponent } from './components/bag-selector-modal/bag-selector-modal.component';
import { DeliveryChoiceComponent } from './components/delivery-choice/delivery-choice.component';
import { OrderIsShipmentWarningComponent } from './components/order-is-shipment-warning/order-is-shipment-warning.component';
import { TimeSlotSelectorComponent } from './components/time-slot-selector/time-slot-selector.component';
import { DeliveryAddressPageComponent } from './pages/delivery-address-page/delivery-address-page.component';
import { DeliveryPaymentPage } from './pages/delivery-payment-page/delivery-payment.page';
import { DeliveryTimePage } from './pages/delivery-time-page/delivery-time.page';
import { OrderSuccessPageComponent } from './pages/order-success-page/order-success-page.component';
import { PersonalInvoiceAddressFormComponent } from './components/personal-invoice-address-form/personal-invoice-address-form.component';

@NgModule({
  declarations: [
    DeliveryAddressFormComponent,
    DeliveryAddressPageComponent,
    DeliveryAddressCartSummaryComponent,
    OrderSuccessPageComponent,
    OrderSuccessApprovalComponent,
    OrderSummaryComponent,
    DeliveryChoiceComponent,
    TimeSlotSelectorComponent,
    CompleteMembershipComponent,
    MobileAgreementsDialogComponent,
    AddressSelectorComponent,
    DeliveryTimePage,
    CheckoutComponent,
    AddDeliveryAddressModalComponent,
    AddInvoiceAddressModalComponent,
    CorporateInvoiceAddressFormComponent,
    DeleteAddressModalComponent,
    BagSelectorModalComponent,
    OrderIsShipmentWarningComponent,
    DeliveryPaymentPage,
    AddDeliveryNoteComponent,
    PersonalInvoiceAddressFormComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    MdcComponentsModule,
    SmCheckoutRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    LineSharedModule,
    CoreModule,
    LineCheckoutModule,
    LinePaymentCreditCardModule,
    PaymentModule,
    LayoutModule,
  ],
  exports: [],
})
export class SmCheckoutModule {}
