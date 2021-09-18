import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CoreModule } from '@fe-commerce/core';
import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { NgxCountdownModule, SharedModule as LibsSharedModule } from '@fe-commerce/shared';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { QuicklinkModule } from 'ngx-quicklink';
import { SwiperModule } from 'swiper/angular';

import {
  ListPageItemComponent,
  RedirectingUrlPage,
  SwiperBannerComponent,
  TimerComponent,
  MobileAppPopupComponent,
} from './components';
import { CampaignDetailModalComponent } from './components/campaign-detail-modal/campaign-detail-modal.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { CreateCampaignComponent } from './components/create-campaign/create-campaign.component';
import { LayoutModule } from './layout';
import { PaginationComponent } from './components/pagination/pagination.component';

@NgModule({
  declarations: [
    TimerComponent,
    RedirectingUrlPage,
    CategoriesComponent,
    CampaignDetailModalComponent,
    CreateCampaignComponent,
    PaginationComponent,
    ListPageItemComponent,
    SwiperBannerComponent,
    MobileAppPopupComponent,
  ],
  imports: [
    CommonModule,
    LayoutModule,
    NgxCountdownModule,
    FontAwesomeModule,
    MdcComponentsModule,
    ReactiveFormsModule,
    FormsModule,
    LibsSharedModule,
    CoreModule,
    RouterModule,
    SwiperModule,
    QuicklinkModule,
  ],
  exports: [
    LayoutModule,
    TimerComponent,
    FontAwesomeModule,
    RedirectingUrlPage,
    CategoriesComponent,
    PaginationComponent,
    ListPageItemComponent,
    SwiperBannerComponent,
    QuicklinkModule,
    MobileAppPopupComponent,
  ],
})
export class SharedModule {}
