import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CampaignBannerModule } from '@fe-commerce/campaign-banner';
import { CartModule, CartProductNoteService } from '@fe-commerce/line-cart';
import { LineCheckoutModule } from '@fe-commerce/line-checkout';
import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { ProductModule as FeProductModule } from '@fe-commerce/product';
import { SharedModule } from '@fe-commerce/shared';
import { CoreModule } from '@fe-commerce/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SwiperModule } from 'swiper/angular';

import { SharedModule as SmSharedModule } from '../shared';

import {
  AlternativeProductChoiceDialogComponent,
  AlternativeProductChoiceMobileComponent,
  MobileCampaignDetailComponent,
  MobileFilterModalComponent,
  MobileSortModalComponent,
  ProductActionsConfirmDialogComponent,
  ProductComponent,
  ProductFiltersDesktopComponent,
  ProductListSliderComponent,
  ProductNotePopoverComponent,
  SmAlternativeProductChoiceComponent,
  SmCartPageItemComponent,
  SpecialDiscountComponent,
  SpecialDiscountProductCardComponent,
} from './components';
import { ProductDiscountsComponent } from './components/product-discounts/product-discounts.component';
import { ProductFeedbackDialogComponent } from './components/product-feedback-dialog/product-feedback-dialog.component';
import { ProductImagesDialogComponent } from './components/product-images-dialog/product-images-dialog.component';
import { ProductImagesComponent } from './components/product-images/product-images.component';
import { CartPage, ListPage, ProductDetailPage } from './pages';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProductRoutingModule } from './product-routing.module';
import { LegalDescriptionComponent } from './components/legal-description/legal-description.component';
import { HowToComponent } from './components/how-to/how-to.component';

@NgModule({
  declarations: [
    CartPage,
    ListPage,
    ProductComponent,
    SpecialDiscountComponent,
    SmCartPageItemComponent,
    SmAlternativeProductChoiceComponent,
    SpecialDiscountProductCardComponent,
    ProductActionsConfirmDialogComponent,
    ProductNotePopoverComponent,
    AlternativeProductChoiceMobileComponent,
    AlternativeProductChoiceDialogComponent,
    ProductFiltersDesktopComponent,
    MobileSortModalComponent,
    MobileFilterModalComponent,
    MobileCampaignDetailComponent,
    HomePageComponent,
    ProductDetailPage,
    ProductImagesDialogComponent,
    ProductImagesComponent,
    ProductFeedbackDialogComponent,
    ProductDiscountsComponent,
    ProductListSliderComponent,
    LegalDescriptionComponent,
    HowToComponent,
  ],
  imports: [
    ProductRoutingModule,
    CommonModule,
    LineCheckoutModule,
    CartModule,
    SharedModule,
    RouterModule,
    FontAwesomeModule,
    MdcComponentsModule,
    CampaignBannerModule,
    SwiperModule,
    FeProductModule,
    SmSharedModule,
    CoreModule,
  ],
  providers: [CartProductNoteService],
})
export class ProductModule {}
