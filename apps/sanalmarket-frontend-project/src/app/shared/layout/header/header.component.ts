import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import {
  AppStateService,
  Browser,
  LoggingService,
  PortfolioEnum,
  SystemCookiesService,
  UserService,
} from '@fe-commerce/core';
import { LocationService } from '@fe-commerce/delivery';
import { EnvService } from '@fe-commerce/env-service';
import { CartService } from '@fe-commerce/line-cart';
import { CheckoutAdditionalService } from '@fe-commerce/line-checkout';
import { AdditionalOrderInfoModel, presenceAnimationFasterTrigger, SubscriptionAbstract } from '@fe-commerce/shared';
import { TrackOrderService } from '@fe-commerce/membership';

import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { faChevronDown, faChevronRight, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import {
  CartInfoDTO,
  CategoryRestControllerService,
  OrderAnonymousRestControllerService,
  OtpAuthenticationControllerService,
  TreeNodeCategoryDTO,
  UserDTO,
} from '@migroscomtr/sanalmarket-angular';
import { EMPTY } from 'rxjs';

import {
  ROUTE_CAMPAIGNS,
  ROUTE_CATEGORIES,
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_MEMBERSHIP,
  ROUTE_SEARCH_MOBILE,
} from '../../../routes';

import { CartDropdownComponent } from './cart-dropdown/cart-dropdown.component';

@Component({
  selector: 'sm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [presenceAnimationFasterTrigger],
})
export class HeaderComponent extends SubscriptionAbstract implements OnInit {
  @ViewChild('cartDropdown') cartDropdownRef?: CartDropdownComponent;
  // Main selected top header tabs
  readonly sanalmarketTab = PortfolioEnum.MARKET;
  readonly elektronikTab = PortfolioEnum.ELECTRONIC;
  readonly kurbanTab = PortfolioEnum.KURBAN;
  readonly hemenTab = PortfolioEnum.HEMEN;

  // Header bottom hovered tabs;
  readonly categories = 'categories';
  readonly promotions = 'promotions';
  readonly migroskop = 'migroskop';
  readonly multipleDiscounts = 'multipleDiscounts';
  readonly brands = 'brands';
  readonly luckyHours = 'luckyHours';
  readonly moneyDiscounts = 'moneyDiscounts';
  readonly gorInan = 'gorInan';

  // ICONS
  faChevronDown: IconDefinition = faChevronDown;
  faChevronRight: IconDefinition = faChevronRight;

  // STATES
  private authenticated: boolean;
  private categoriesSubCategoriesWrapperOpened = false;
  private hoveredHeaderBottomTab: string;
  private hoveredCategory: TreeNodeCategoryDTO;
  private selectedTab = this.sanalmarketTab;
  private phoneNumber: string;
  private id: number;

  // DATA
  private user: UserDTO;
  private cartInfo: CartInfoDTO;
  private productCategories: TreeNodeCategoryDTO[];
  private _additionalOrderStatus: AdditionalOrderInfoModel;

  constructor(
    private userService: UserService,
    private authenticationService: OtpAuthenticationControllerService,
    private systemCookiesService: SystemCookiesService,
    private locationService: LocationService,
    private router: Router,
    private loggingService: LoggingService,
    private cartService: CartService,
    private productCategoryTreeService: CategoryRestControllerService,
    private _additionalOrderService: CheckoutAdditionalService,
    private appStateService: AppStateService,
    private _envService: EnvService,
    private _dialog: MatDialog,
    private _orderAnonymousRestControllerService: OrderAnonymousRestControllerService,
    private _trackOrderService: TrackOrderService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initialize();
  }

  isCategoriesSubCategoriesWrapperOpened(): boolean {
    return this.categoriesSubCategoriesWrapperOpened;
  }

  isSanalmarketSelected(): boolean {
    return this.selectedTab === PortfolioEnum.MARKET;
  }

  isWrapperExpanded(): boolean {
    return !!this.hoveredCategory;
  }

  isCategoriesHovered(): boolean {
    return this.getSelectedHoveredTab() === this.categories;
  }

  isPromotionsHovered(): boolean {
    if (
      !this.getSelectedHoveredTab() &&
      this.router.url === `/${ROUTE_CAMPAIGNS}` &&
      !this.isCategoriesSubCategoriesWrapperOpened()
    ) {
      return true;
    }
    return this.getSelectedHoveredTab() === this.promotions;
  }

  isMigroskopHovered(): boolean {
    return this.getSelectedHoveredTab() === this.migroskop;
  }

  isMultipleDiscountsHovered(): boolean {
    return this.getSelectedHoveredTab() === this.multipleDiscounts;
  }

  isLuckyHoursHovered(): boolean {
    return this.getSelectedHoveredTab() === this.luckyHours;
  }

  isMoneyDiscountsHovered(): boolean {
    return this.getSelectedHoveredTab() === this.moneyDiscounts;
  }

  isGorInanHovered(): boolean {
    return this.getSelectedHoveredTab() === this.gorInan;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  isHoveredCategory(category: TreeNodeCategoryDTO): boolean {
    return this.hoveredCategory === category;
  }

  isHeaderTopVisible(): boolean {
    // *** add routes into parentheses to see header top in the page ***
    const url = this.router.url.replace('/', '');
    return url !== ROUTE_CATEGORIES;
  }

  isHeaderBottomVisible(): boolean {
    // *** add routes into parentheses to see header bottom in the page ***
    const url = this.router.url.replace('/', '');
    return url !== ROUTE_CATEGORIES;
  }

  isElectronicTabVisible(): boolean {
    return this._envService.isElectronicEnabled;
  }

  isElectronicSelected(): boolean {
    return this.selectedTab === PortfolioEnum.ELECTRONIC;
  }

  isMarketSelected(): boolean {
    return this.selectedTab === PortfolioEnum.MARKET;
  }

  isKurbanTabVisible(): boolean {
    return this._envService.isKurbanEnabled;
  }

  isKurbanSelected(): boolean {
    return this.selectedTab === PortfolioEnum.KURBAN;
  }

  isHemenSelected(): boolean {
    return this.selectedTab === PortfolioEnum.HEMEN;
  }

  isHemenTabVisible(): boolean {
    return this._envService.isHemenEnabled;
  }

  getHeaderClass(): string {
    return this.selectedTab;
  }

  getUser(): UserDTO {
    return this.user;
  }

  getCardInfo(): CartInfoDTO {
    return this.cartInfo;
  }

  getSelectedHoveredTab(): string {
    return this.hoveredHeaderBottomTab;
  }

  getProductCategories(): TreeNodeCategoryDTO[] {
    return this.productCategories;
  }

  getHoveredCategory(): TreeNodeCategoryDTO {
    return this.hoveredCategory;
  }

  getAdditionalOrderStatus(): AdditionalOrderInfoModel {
    return this._additionalOrderStatus;
  }

  setSelectedTab(selected: PortfolioEnum): void {
    this.selectedTab = selected;
    this.appStateService.setPortfolio(selected);
    this.userService.getUser();
    this.fetchCategoryTree();

    if (selected === PortfolioEnum.MARKET) {
      this.router.navigate([ROUTE_HOME]);
    } else {
      this.router.navigate([this.selectedTab]);
    }
  }

  onClickMenuItem(name: string): void {
    this.router.navigate([`${ROUTE_MEMBERSHIP}/${name}`]);
  }

  onMouseEnterBottomTab(hovered: string): void {
    if (hovered === this.categories) {
      this.categoriesSubCategoriesWrapperOpened = true;
    }
    this.hoveredHeaderBottomTab = hovered;
  }

  onClickSearchCombobox(): void {
    if (Browser.isMobile()) {
      this.router.navigate([ROUTE_SEARCH_MOBILE]);
    }
  }

  // TODO: Check this event type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMouseLeaveBottomTab(event?: any): void {
    if (event && event.toElement && !event.toElement.classList.contains('categories-wrapper')) {
      this.categoriesSubCategoriesWrapperOpened = false;
    }
    this.hoveredHeaderBottomTab = undefined;
  }

  onMouseLeaveSubCategoriesWrapper(): void {
    this.categoriesSubCategoriesWrapperOpened = false;
    this.hoveredCategory = undefined;
    this.onMouseLeaveBottomTab();
  }

  onMouseEnterCategory(category: TreeNodeCategoryDTO): void {
    this.hoveredCategory = category;
  }

  onClickLoginSignup(): void {
    this.router.navigate([ROUTE_LOGIN]);
  }

  onClickTrack(): void {
    this._trackOrderService.openTrackOrderModal();
  }

  onAccountDropdownLogoutClick(): void {
    this.authenticationService
      .logout()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(() => {
        this.systemCookiesService.removeUserCredentials();
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
  }

  initialize(): void {
    this.subscribeToAppState();
    this.subscribeToUserAuthState();
    this.subscribeToUser();
    this.subscribeToCart();
    this.fetchCategoryTree();
    this.subscribeToAdditonalOrder();
  }

  fetchCategoryTree(): void {
    this.productCategoryTreeService
      .getCategoryTree()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        map((response) => response.data),
        tap((productCategories) => {
          productCategories.forEach((item) => {
            item.children.sort((one, other) => {
              return other.children.length - one.children.length;
            });
          });
        })
      )
      .subscribe((data) => {
        this.productCategories = data;
      });
  }

  subscribeToUser(): void {
    this.userService.user$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((user) => {
      this.user = user;
    });
  }

  subscribeToAdditonalOrder(): void {
    this._additionalOrderService.isActive$.subscribe((status) => {
      this._additionalOrderStatus = status;
    });
  }

  subscribeToUserAuthState(): void {
    this.userService.isAuthenticated$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((isAuthenticated) => {
      this.authenticated = isAuthenticated;
    });
  }

  subscribeToCart(): void {
    this.cartService.cart$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((cartInfo) => {
      this.cartInfo = cartInfo;
    });
  }

  subscribeToAppState(): void {
    this.appStateService.getPortfolio$().subscribe((portfolio: PortfolioEnum) => {
      this.selectedTab = portfolio;
    });
  }

  startAdditionalOrder(orderId: number): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this._additionalOrderService.start(orderId).subscribe(() => {});
  }

  exitAdditionalOrder(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this._additionalOrderService.stop().subscribe(() => {});
  }
}
