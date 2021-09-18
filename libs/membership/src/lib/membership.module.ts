import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LineSharedModule } from '@fe-commerce/line-shared';
import { MaterialModule, SharedModule } from '@fe-commerce/shared';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  AddressListComponent,
  AddressListItemComponent,
  AnonymousTrackOrderModalComponent,
  CrmComponent,
  OrderComponent,
  PastOrderComponent,
  PastOrderItemComponent,
  PastOrderItemListComponent,
  PastOrderSummaryComponent,
  RatingDialogComponent,
  RatingStarsComponent,
  RatingSuccessDialogComponent,
  UnratedOrdersListComponent,
} from './components';
import { CrmAdvantagesInfoComponent } from './components/crm/sub-components/crm-advantages-info/crm-advantages-info.component';
import { CrmMemberComponent } from './components/crm/sub-components/crm-member/crm-member.component';
import { CrmPhoneInfoComponent } from './components/crm/sub-components/crm-phone-info/crm-phone-info.component';
import { CrmRegistrationFormComponent } from './components/crm/sub-components/crm-registration-form/crm-registration-form.component';
import { CrmRegistrationPanelComponent } from './components/crm/sub-components/crm-registration-panel/crm-registration-panel.component';
import { CrmUnverifiedComponent } from './components/crm/sub-components/crm-unverified/crm-unverified.component';

@NgModule({
  declarations: [
    AddressListComponent,
    AddressListItemComponent,
    OrderComponent,
    PastOrderItemListComponent,
    PastOrderItemComponent,
    PastOrderComponent,
    PastOrderSummaryComponent,
    CrmComponent,
    CrmMemberComponent,
    CrmRegistrationFormComponent,
    CrmRegistrationPanelComponent,
    CrmPhoneInfoComponent,
    CrmAdvantagesInfoComponent,
    CrmUnverifiedComponent,
    UnratedOrdersListComponent,
    RatingDialogComponent,
    RatingSuccessDialogComponent,
    RatingStarsComponent,
    AnonymousTrackOrderModalComponent,
  ],
  exports: [
    AddressListComponent,
    AddressListItemComponent,
    CrmComponent,
    OrderComponent,
    PastOrderItemListComponent,
    PastOrderItemComponent,
    PastOrderComponent,
    PastOrderSummaryComponent,
    UnratedOrdersListComponent,
    RatingStarsComponent,
    AnonymousTrackOrderModalComponent,
  ],
  imports: [
    CommonModule,
    LineSharedModule,
    SharedModule,
    MaterialModule,
    RouterModule,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
})
export class MembershipModule {}
