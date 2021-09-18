import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppStateService, Browser, PortfolioEnum, SeoService } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';

import {
  ROUTE_BRANDS,
  ROUTE_CAMPAIGNS,
  ROUTE_CAMPAIGNS_LEGACY,
  ROUTE_CATEGORIES,
  ROUTE_COMPANY_INFO,
  ROUTE_CONTACT,
  ROUTE_CUSTOMER_SUPPORT,
  ROUTE_DYNAMIC_PAGE,
  ROUTE_ELECTRONIC,
  ROUTE_ELECTRONIC_ARCHIVE,
  ROUTE_FAVORITE_PRODUCTS,
  ROUTE_HEALTHY_LIFE,
  ROUTE_HEMEN,
  ROUTE_HOME,
  ROUTE_MEMBERSHIP,
  ROUTE_MEMBERSHIP_INFORMATION,
  ROUTE_MONEY_GOLD,
  ROUTE_NEAREST_STORE,
  ROUTE_PERSONAL_DATA,
  ROUTE_POINTS,
  ROUTE_PROCESS_GUIDE,
  ROUTE_PRODUCT_PAGE,
  ROUTE_PRODUCT_SEARCH_LIST_PAGE,
  ROUTE_PRODUCT_SEARCH_PAGE,
  ROUTE_SACRIFICE,
  ROUTE_SEARCH_MOBILE,
  ROUTE_SECURITY,
  ROUTE_TERMS_OF_USE_AND_PRIVACY,
  ROUTE_USER_ADDRESSES,
  ROUTE_USER_ORDERS,
} from './routes';

@Component({
  selector: 'sm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'sanalmarket-frontend-project';
  theme = PortfolioEnum.MARKET;

  constructor(
    private router: Router,
    private _seoService: SeoService,
    private _cartService: CartService,
    private _appStateService: AppStateService,
    private _overlayContainer: OverlayContainer
  ) {}

  ngOnInit(): void {
    this._seoService.subscribeToRouter();
    if (!this.isLandingPageRoute()) {
      this._cartService.subscribeToDistrictChange();
      this._subscribeToAppState();
    }
  }

  isHeaderLite(): boolean {
    // *** add routes into parentheses to active normal header in that page ***
    const url = location.pathname.replace('/', '');

    return !(
      // Home
      (
        url === ROUTE_HOME ||
        url === ROUTE_ELECTRONIC ||
        url === ROUTE_SACRIFICE ||
        url === ROUTE_HEMEN ||
        url.includes(ROUTE_CATEGORIES) ||
        url.includes(ROUTE_PROCESS_GUIDE) ||
        url.includes(ROUTE_PERSONAL_DATA) ||
        url.includes(ROUTE_BRANDS) ||
        url === ROUTE_TERMS_OF_USE_AND_PRIVACY ||
        url === ROUTE_CUSTOMER_SUPPORT ||
        url === ROUTE_CONTACT ||
        url === ROUTE_SECURITY ||
        url === ROUTE_ELECTRONIC_ARCHIVE ||
        url === ROUTE_COMPANY_INFO ||
        url.includes(ROUTE_CAMPAIGNS) ||
        url.includes(ROUTE_MEMBERSHIP) ||
        this.isRouteUnderMembership(url) ||
        url === ROUTE_CAMPAIGNS_LEGACY ||
        (ROUTE_PRODUCT_PAGE.test(url) && !Browser.isMobile()) ||
        (url.includes(ROUTE_PRODUCT_SEARCH_PAGE) && !Browser.isMobile()) ||
        url === ROUTE_NEAREST_STORE ||
        (ROUTE_PRODUCT_SEARCH_LIST_PAGE.test(url) && !Browser.isMobile()) ||
        ROUTE_DYNAMIC_PAGE.test(url)
      )
    );
  }

  isHeaderVisible(): boolean {
    // *** add routes into parentheses to active normal header in that page ***
    const url = location.pathname.replace('/', '');
    return url !== ROUTE_SEARCH_MOBILE;
  }

  isRouteUnderMembership(url: string): boolean {
    url = url.split('/')[1];
    return (
      url === ROUTE_USER_ADDRESSES ||
      url === ROUTE_MEMBERSHIP_INFORMATION ||
      url === ROUTE_USER_ORDERS ||
      url === ROUTE_FAVORITE_PRODUCTS ||
      url === ROUTE_POINTS ||
      url === ROUTE_HEALTHY_LIFE
    );
  }

  isLandingPageRoute(): boolean {
    const url = location.pathname.replace('/', '');

    return url === ROUTE_MONEY_GOLD;
  }

  // The Overlay container block the theme propagation, so we need to add class to this overlay container as well
  private _subscribeToAppState(): void {
    this._appStateService.getPortfolio$().subscribe((portfolio: PortfolioEnum) => {
      // Remove previous theme class from overlay container
      this._overlayContainer.getContainerElement().classList.remove(this.theme);

      // Change theme of main container
      this.theme = portfolio;

      // Add current theme class to overlay container
      this._overlayContainer.getContainerElement().classList.add(this.theme);
    });
  }
}
