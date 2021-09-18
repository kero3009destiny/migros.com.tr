import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CoreModule } from '@fe-commerce/core';
import { LineSharedModule } from '@fe-commerce/line-shared';
import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { MembershipModule } from '@fe-commerce/membership';
import { SharedModule } from '@fe-commerce/shared';

import { SharedModule as SmSharedModule } from '../shared';

import {
  BasicInformationFormComponent,
  ContactPreferencesFormComponent,
  CouponComponent,
  HealthyLifeJourneyChartComponent,
  ItemDetailComponent,
  MainInformationFormComponent,
  MobileBreadcrumbComponent,
  MoneyPointComponent,
  MoneyRegisterBannerComponent,
  OrderCategoryComponent,
  OrderFeedbackFormDialogComponent,
  SideNavComponent,
  SideNavLinkComponent,
  SmCategoryComponent,
  MoneyGoldBannerComponent,
} from './components';
import { OrderAddressDialogComponent } from './components/order-address-dialog/order-address-dialog.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { OrderRateDialog } from './components/order-rate/order-rate-dialog.component';
import { OrderRescheduleDialogComponent } from './components/order-reschedule-dialog/order-reschedule-dialog.component';
import { OrderStatusBarComponent } from './components/order-status-bar/order-status-bar.component';
import { PastOrderListItemComponent } from './components/past-order-list-item/past-order-list-item.component';
import { MembershipRoutingModule } from './membership-routing.module';
import {
  FavoriteItemsPage,
  HealthyLifeJourneyPage,
  MembershipInformationPage,
  MembershipShellPageComponent,
  MoneyPointAndCouponPageComponent,
  MoneyRegisterPage,
  UserAddressessPageComponent,
  OrdersPage,
  MoneyGoldPage,
} from './pages';
import { TrackOrderPage } from './pages/track-order/track-order.page';

@NgModule({
  declarations: [
    MembershipShellPageComponent,
    //
    HealthyLifeJourneyPage,
    MembershipInformationPage,
    MoneyRegisterPage,
    FavoriteItemsPage,
    OrdersPage,
    MoneyGoldPage,
    //
    SideNavLinkComponent,
    SideNavComponent,
    HealthyLifeJourneyChartComponent,
    MoneyPointComponent,
    CouponComponent,
    MoneyPointAndCouponPageComponent,
    UserAddressessPageComponent,
    BasicInformationFormComponent,
    ContactPreferencesFormComponent,
    MainInformationFormComponent,
    MoneyRegisterBannerComponent,
    MobileBreadcrumbComponent,
    OrderCategoryComponent,
    SmCategoryComponent,
    PastOrderListItemComponent,
    OrderDetailComponent,
    OrderStatusBarComponent,
    OrderRateDialog,
    OrderFeedbackFormDialogComponent,
    OrderAddressDialogComponent,
    OrderRescheduleDialogComponent,
    ItemDetailComponent,
    TrackOrderPage,
    MoneyGoldBannerComponent,
  ],
  imports: [
    CommonModule,
    MdcComponentsModule,
    SharedModule,
    MembershipRoutingModule,
    LineSharedModule,
    MembershipModule,
    ClipboardModule,
    SmSharedModule,
    CoreModule,
  ],
  exports: [],
})
export class SmMembershipModule {}
