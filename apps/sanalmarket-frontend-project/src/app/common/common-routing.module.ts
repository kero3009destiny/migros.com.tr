import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RouteGuard } from '@fe-commerce/core';

import {
  ROUTE_ALO_MIGROS,
  ROUTE_BRANDS,
  ROUTE_CAMPAIGNS,
  ROUTE_CAMPAIGNS_LEGACY,
  ROUTE_CATEGORIES,
  ROUTE_COMPANY_INFO,
  ROUTE_CONTACT,
  ROUTE_CUSTOMER_SUPPORT,
  ROUTE_DIGITAL_GAME_CODES,
  ROUTE_DIGITAL_GAME_CODES_TR,
  ROUTE_ELECTRONIC_ARCHIVE,
  ROUTE_MONEY_TRANSFER,
  ROUTE_MONEY_TRANSFER_INFO,
  ROUTE_NEAREST_STORE,
  ROUTE_PERSONAL_DATA,
  ROUTE_PROCESS_GUIDE,
  ROUTE_SEARCH_MOBILE,
  ROUTE_SECURITY,
  ROUTE_TERMS_OF_USE_AND_PRIVACY,
} from '../routes';
import { CategoriesComponent } from '../shared/components/categories/categories.component';

import { CampaignsComponent } from './components/campaigns/campaigns.component';
import { SearchMobileComponent } from './components/search-mobile/search-mobile.component';
import { DynamicPageUrlMatchFactory } from './dynamic-page-url-match.factory';
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
  imports: [
    RouterModule.forChild([
      {
        path: '',
        canActivate: [RouteGuard],
        children: [
          {
            path: ROUTE_ALO_MIGROS,
            component: AloMigrosPage,
          },
          {
            path: ROUTE_BRANDS,
            component: BrandsPage,
            data: { screenName: 'Brands' },
          },
          {
            path: ROUTE_DIGITAL_GAME_CODES,
            component: DigitalGameCodesComponent,
            data: { screenName: 'Game Codes' },
          },
          {
            path: ROUTE_DIGITAL_GAME_CODES_TR,
            component: DigitalGameCodesComponent,
            data: { screenName: 'Game Codes' },
          },
          {
            path: ROUTE_MONEY_TRANSFER,
            component: MoneyTransferPage,
          },
          {
            matcher: DynamicPageUrlMatchFactory,
            component: DynamicPage,
          },
          {
            path: ROUTE_MONEY_TRANSFER_INFO,
            component: DynamicPage,
          },
          {
            path: ROUTE_CAMPAIGNS,
            component: CampaignsComponent,
            data: { screenName: 'Campaigns' },
          },
          {
            path: ROUTE_CAMPAIGNS_LEGACY,
            component: CampaignsComponent,
            data: { screenName: 'My Campaign' },
          },
          {
            path: ROUTE_CATEGORIES,
            component: CategoriesComponent,
          },
          {
            path: ROUTE_SEARCH_MOBILE,
            component: SearchMobileComponent,
          },
          {
            path: ROUTE_PROCESS_GUIDE,
            component: ProcessGuidePage,
          },
          {
            path: ROUTE_PERSONAL_DATA,
            component: PersonalDataPage,
          },
          {
            path: ROUTE_CUSTOMER_SUPPORT,
            component: SupportPage,
          },
          {
            path: ROUTE_CONTACT,
            component: ContactPage,
          },
          {
            path: ROUTE_SECURITY,
            component: SecureShoppingPage,
          },
          {
            path: ROUTE_ELECTRONIC_ARCHIVE,
            component: ElectronicArchivePage,
          },
          {
            path: ROUTE_TERMS_OF_USE_AND_PRIVACY,
            component: PrivacyPage,
          },
          {
            path: ROUTE_COMPANY_INFO,
            component: CompanyInfoPage,
          },
          {
            path: ROUTE_NEAREST_STORE,
            component: NearestStorePage,
          },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class SmCommonRoutingModule {}
