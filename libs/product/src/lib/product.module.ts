import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material-experimental/mdc-button';
import { MatTableModule } from '@angular/material-experimental/mdc-table';
import { RouterModule } from '@angular/router';

import { CoreModule } from '@fe-commerce/core';
import { CartModule } from '@fe-commerce/line-cart';
import { MaterialModule, SharedModule } from '@fe-commerce/shared';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SwiperModule } from 'swiper/angular';

import {
  BagWarningComponent,
  MainSectionComponent,
  OtpBeforeCheckoutDialogComponent,
  ProducerInfoComponent,
  ProductCardComponent,
  ProductDetailTabsComponent,
  ProductListComponent,
  ProductRecommendationComponent,
  ProductRecommendationDialogComponent,
  ProductRecommendationFormComponent,
  ProductSearchComboboxComponent,
  ProductSpecialTagDialogComponent,
  PublicShoppingListCarouselComponent,
  PublicShoppingListItemComponent,
  SearchResultItemComponent,
  SegmentifyProductRecommendationComponent,
  ShoppingListComponent,
  ShoppingListDialogComponent,
  ShoppingListItemComponent,
  UserShoppingListActionsComponent,
  UserShoppingListComponent,
  UserShoppingListItemComponent,
  UserShoppingListItemsComponent,
  UserShoppingListItemSkeletonComponent,
  UserShoppingListSkeletonComponent,
  CookieIndicatorComponent,
} from './components';
import { ConfirmShoppingListPage } from './pages';
import { CookieSettingsComponent } from './components/cookie-settings/cookie-settings.component';
import { CookieSettingsService } from './services';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    SharedModule,
    MaterialModule,
    CoreModule,
    CartModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    MatTableModule,
    SwiperModule,
    MatButtonModule,
  ],
  declarations: [
    BagWarningComponent,
    MainSectionComponent,
    OtpBeforeCheckoutDialogComponent,
    ProducerInfoComponent,
    ShoppingListComponent,
    ShoppingListDialogComponent,
    ShoppingListItemComponent,
    PublicShoppingListItemComponent,
    PublicShoppingListCarouselComponent,
    ProductCardComponent,
    ProductListComponent,
    ProductDetailTabsComponent,
    ProductSpecialTagDialogComponent,
    ProductRecommendationComponent,
    ProductRecommendationDialogComponent,
    ProductRecommendationFormComponent,
    ProductSearchComboboxComponent,
    SearchResultItemComponent,
    // Shopping List
    UserShoppingListComponent,
    UserShoppingListSkeletonComponent,
    UserShoppingListItemsComponent,
    UserShoppingListActionsComponent,
    UserShoppingListItemComponent,
    UserShoppingListItemSkeletonComponent,
    ConfirmShoppingListPage,
    SegmentifyProductRecommendationComponent,
    CookieIndicatorComponent,
    CookieSettingsComponent,
  ],
  exports: [
    BagWarningComponent,
    MainSectionComponent,
    OtpBeforeCheckoutDialogComponent,
    ProducerInfoComponent,
    ShoppingListComponent,
    ShoppingListDialogComponent,
    PublicShoppingListCarouselComponent,
    ProductCardComponent,
    ProductListComponent,
    ProductDetailTabsComponent,
    ProductSpecialTagDialogComponent,
    ProductRecommendationComponent,
    ProductRecommendationDialogComponent,
    ProductRecommendationFormComponent,
    ProductSearchComboboxComponent,
    SearchResultItemComponent,
    // Shopping List
    UserShoppingListComponent,
    UserShoppingListSkeletonComponent,
    UserShoppingListItemsComponent,
    UserShoppingListActionsComponent,
    UserShoppingListItemComponent,
    UserShoppingListItemSkeletonComponent,
    ConfirmShoppingListPage,
    SegmentifyProductRecommendationComponent,
    CookieIndicatorComponent,
  ],
  providers: [CookieSettingsService],
})
export class ProductModule {}
