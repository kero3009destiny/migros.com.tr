import { CommonModule as AngularCommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MapsModule } from '@fe-commerce/maps';
import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { ProductModule } from '@fe-commerce/product';
import { SharedModule as LibsSharedModule } from '@fe-commerce/shared';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { SmCommonRoutingModule } from './common-routing.module';
import {
  AloMigrosDropdownComponent,
  AloMigrosInfoComponent,
  AloMigrosPhoneComponent,
  CampaignProgressBarComponent,
  MoneyTransferLocationsComponent,
  MoneyTransferStepsComponent,
  MoneyTransferTabsComponent,
} from './components';
import { CampaignsComponent } from './components/campaigns/campaigns.component';
import { SearchMobileComponent } from './components/search-mobile/search-mobile.component';
import {
  AloMigrosPage,
  BrandsPage,
  CompanyInfoPage,
  ContactPage,
  DigitalGameCodesComponent,
  DynamicPage,
  ElectronicArchivePage,
  MoneyTransferPage,
  NearestStorePage,
  PersonalDataPage,
  PrivacyPage,
  ProcessGuidePage,
  SecureShoppingPage,
  SupportPage,
} from './pages';

@NgModule({
  declarations: [
    AloMigrosPage,
    AloMigrosDropdownComponent,
    AloMigrosInfoComponent,
    AloMigrosPhoneComponent,
    BrandsPage,
    DigitalGameCodesComponent,
    MoneyTransferPage,
    MoneyTransferLocationsComponent,
    MoneyTransferStepsComponent,
    MoneyTransferTabsComponent,
    ProcessGuidePage,
    SearchMobileComponent,
    CampaignsComponent,
    PersonalDataPage,
    SupportPage,
    ContactPage,
    SecureShoppingPage,
    NearestStorePage,
    ElectronicArchivePage,
    PrivacyPage,
    CompanyInfoPage,
    CampaignProgressBarComponent,
    DynamicPage,
  ],
  imports: [
    AngularCommonModule,
    FormsModule,
    ReactiveFormsModule,
    //
    FontAwesomeModule,
    //
    MdcComponentsModule,
    SmCommonRoutingModule,
    LibsSharedModule,
    ProductModule,
    MapsModule,
  ],
})
export class CommonModule {}
