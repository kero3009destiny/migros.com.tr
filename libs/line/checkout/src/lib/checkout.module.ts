import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material-experimental/mdc-button';
import { RouterModule } from '@angular/router';

import { MaterialModule, SharedModule } from '@fe-commerce/shared';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  AddressSelectComponent,
  CheckoutDeliveryTypeComponent,
  CheckoutFooterComponent,
  CheckoutHeaderComponent,
  CheckoutStepsComponent,
  CrmStatusComponent,
  DeliverySummaryComponent,
  PaymentItemComponent,
  AnonymousCheckoutSummaryComponent,
  AnonymousOnlyOnlinePaymentInfoComponent,
  DeliveryAddressFormComponent,
} from './components';
import { CheckoutPriceSummaryComponent } from './components/checkout-price-summary/checkout-price-summary.component';
import { CheckoutSummaryDesktopComponent } from './components/checkout-summary-desktop/checkout-summary-desktop.component';
import { CheckoutSummaryMobileComponent } from './components/checkout-summary-mobile/checkout-summary-mobile.component';
import { CheckoutSummaryComponent } from './components/checkout-summary/checkout-summary.component';

@NgModule({
  declarations: [
    AddressSelectComponent,
    CheckoutFooterComponent,
    CheckoutHeaderComponent,
    CheckoutStepsComponent,
    CrmStatusComponent,
    DeliverySummaryComponent,
    PaymentItemComponent,
    CrmStatusComponent,
    CheckoutSummaryComponent,
    CheckoutDeliveryTypeComponent,
    CheckoutSummaryDesktopComponent,
    CheckoutSummaryMobileComponent,
    CheckoutPriceSummaryComponent,
    AnonymousCheckoutSummaryComponent,
    AnonymousOnlyOnlinePaymentInfoComponent,
    DeliveryAddressFormComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    FontAwesomeModule,
    MatButtonModule,
  ],
  exports: [
    AddressSelectComponent,
    CheckoutFooterComponent,
    CheckoutHeaderComponent,
    CrmStatusComponent,
    DeliverySummaryComponent,
    PaymentItemComponent,
    CheckoutStepsComponent,
    CheckoutSummaryComponent,
    CheckoutDeliveryTypeComponent,
    CheckoutPriceSummaryComponent,
    AnonymousCheckoutSummaryComponent,
    AnonymousOnlyOnlinePaymentInfoComponent,
    DeliveryAddressFormComponent,
  ],
})
export class LineCheckoutModule {}
