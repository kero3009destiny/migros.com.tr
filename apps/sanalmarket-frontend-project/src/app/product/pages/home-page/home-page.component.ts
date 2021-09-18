import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { MatTabGroup } from '@angular/material-experimental/mdc-tabs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import {
  AppStateService,
  Browser,
  GtmService,
  LoadingIndicatorService,
  LoggingService,
  PortfolioEnum,
  UserService,
} from '@fe-commerce/core';
import { LocationService } from '@fe-commerce/delivery';
import { CartService } from '@fe-commerce/line-cart';
import {
  FormatPricePipe,
  GtmDataModel,
  presenceAnimationFasterTrigger,
  ProductInfoModel,
  SubscriptionAbstract,
} from '@fe-commerce/shared';

import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';

import { faArrowCircleRight, faChevronRight } from '@fortawesome/pro-light-svg-icons';
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons';
import {
  AppResponseHomeScreenDTO,
  BannerDTO,
  CartInfoDTO,
  CartItemInfoDTO,
  CategoryDTO,
  CategoryRestControllerService,
  HomeScreenControllerService,
  HomeScreenDTO,
  ShoppingListDTO,
  SimpleOrderFeedbackDTO,
  StoreProductInfoDTO,
} from '@migroscomtr/sanalmarket-angular';
import { combineLatest, EMPTY, Observable } from 'rxjs';

import { OrderRateDialog } from '../../../membership/components/order-rate/order-rate-dialog.component';
import { ROUTE_CATEGORIES, ROUTE_MEMBERSHIP, ROUTE_MONEY_REGISTER, ROUTE_USER_ORDERS } from '../../../routes';
import { MOBILE_APP_LINKS, MobileAppLink } from '../../../shared/layout/footer/links-data';

@Component({
  selector: 'sm-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  animations: [presenceAnimationFasterTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent extends SubscriptionAbstract implements OnInit {
  // All of the containers that contains sm-list-page-items.
  @ViewChildren('container') listItemContainers;

  // ICON
  arrowCircleRight = faArrowCircleRight;
  faChevronRight = faChevronRight;
  savedIcon = faCheckCircle;

  readonly moneyGoldText = 'money.com';

  // DATA
  private _homeScreenData: HomeScreenDTO;
  private _topLevelCategories: CategoryDTO[];
  private _cartInfo: CartInfoDTO;
  // STATE
  private _moneyUser = true;
  private selectedTabShoppingList: ShoppingListDTO;
  private _loading = true;
  private isAuthenticated;
  private bannerVisible: boolean;

  private datePipe = new DatePipe('tr');
  private formatPricePipe = new FormatPricePipe();
  private readonly containerItemThreshold = 5;
  private readonly mainShoppingListUserType = 'USER';
  private _portfolio = PortfolioEnum.MARKET;
  private _pageInitialized = false;

  constructor(
    private _userService: UserService,
    private _locationService: LocationService,
    private _router: Router,
    private _homeScreenControllerService: HomeScreenControllerService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _productCategoryTreeService: CategoryRestControllerService,
    private _matDialog: MatDialog,
    private _cdr: ChangeDetectorRef,
    private _cartService: CartService,
    private gtmService: GtmService,
    private _titleService: Title,
    private _metaService: Meta,
    private _appStateService: AppStateService,
    private _loggingService: LoggingService
  ) {
    super();
  }

  ngOnInit(): void {
    this._initializePage();
    this._subscribeToLocation();
    this.sendGtmPageViewEvent('Home', 'Anasayfa | Sanal Market');
  }

  isMoneyRegistrationVisible(): boolean {
    return !this._moneyUser && this.isAuthenticated;
  }

  isLoading(): boolean {
    return this._loading;
  }

  isUnratedOrdersVisible(): boolean {
    return this._homeScreenData?.unratedOrders.length > 0;
  }

  isMobile(): boolean {
    return Browser.isMobile();
  }

  isArrowButtonsVisible(length: number): boolean {
    return length > this.containerItemThreshold;
  }

  isPortfolioHemen(): boolean {
    return this._portfolio === PortfolioEnum.HEMEN;
  }

  isSeeAllButtonVisible(shoppingList: ShoppingListDTO): boolean {
    return shoppingList.type.toLowerCase() !== this.mainShoppingListUserType.toLowerCase();
  }

  isShoppingListVisible(): boolean {
    return this._homeScreenData?.tabShoppingLists.length > 0;
  }

  isBannerVisible(): boolean {
    return this.bannerVisible;
  }

  getUnratedOrderSampleImagesDelta(imagesLength, unratedOrderLength): number {
    return unratedOrderLength - imagesLength;
  }

  getUnratedOrderDate(date: string): string {
    return this.datePipe.transform(new Date(date), 'dd MMMM yyyy');
  }

  getCartItem(product: StoreProductInfoDTO): CartItemInfoDTO {
    return this._cartInfo.itemInfos?.find((cartItemInfo) => cartItemInfo.product.sku === product.sku);
  }

  getMainPageSliderBanners(): BannerDTO[] {
    return this._homeScreenData?.bannersMap['MAIN_PAGE_SLIDER'];
  }

  getMainPageUnderSliderBanners(): BannerDTO[] {
    return this._homeScreenData?.bannersMap['MAIN_PAGE_UNDER_SLIDER'];
  }

  getMainPageMiddleBanners(): BannerDTO[] {
    return this._homeScreenData?.bannersMap['MAIN_PAGE_MIDDLE_1'];
  }

  getStoreObjects(): MobileAppLink[] {
    return MOBILE_APP_LINKS;
  }

  getStoreImageSource(link: string): string {
    if (link.includes('apple')) {
      return 'assets/logos/mobile-app/appstore-tr.svg';
    }
    if (link.includes('google')) {
      return 'assets/logos/mobile-app/googleplay-tr.svg';
    }
    if (link.includes('huawei')) {
      return 'assets/logos/mobile-app/huawei-appgallery-tr.svg';
    }
  }

  getUnratedOrderInfoText(unratedOrder: SimpleOrderFeedbackDTO): string {
    if (Object.prototype.hasOwnProperty.call(unratedOrder, 'delivered_price')) {
      return `${this.formatPricePipe.transform(unratedOrder.revenue)} TL'lik siparişin gramaj farklılıkları,
       alternatif ürünler ve varsa stoğumuzda tükenmiş olan ürünler nedeniyle ${this.formatPricePipe.transform(
         unratedOrder.deliveredPrice
       )} TL olarak teslim edilmiştir.`;
    }
    return `${this.formatPricePipe.transform(
      unratedOrder.revenue
    )} TL'lik siparişin eksiksiz bir şekilde teslim edilmiştir.`;
  }

  getCategoryImgSrc(category: CategoryDTO): string {
    if (category.images.length > 0) {
      return category.images[0].urls.x3;
    }
    return category.iconUrl;
  }

  getTabShoppingLists(): ShoppingListDTO[] {
    return this._homeScreenData?.tabShoppingLists;
  }

  getMainShoppingLists(): ShoppingListDTO[] {
    return this._homeScreenData?.mainShoppingLists;
  }

  getSampleStoreProducts(unratedOrderId: number): StoreProductInfoDTO[] {
    return this._homeScreenData.unratedOrders.find((unratedOrder) => {
      return unratedOrder.orderId === unratedOrderId;
    })?.sampleStoreProducts;
  }

  getTopLevelCategories(): CategoryDTO[] {
    return this.isMobile() && this._topLevelCategories.length > 11
      ? this._topLevelCategories.slice(0, 11)
      : this._topLevelCategories;
  }

  getUnratedOrders(): SimpleOrderFeedbackDTO[] {
    return this._homeScreenData?.unratedOrders;
  }

  getGtmData(product: ProductInfoModel, listName: string): GtmDataModel[] {
    const gtmListName = 'shoppinglist/' + listName;
    return [
      {
        name: 'impression',
        product,
        list: gtmListName,
      },
    ];
  }

  onClickAllUnratedOrders(): void {
    this._router.navigate([`${ROUTE_MEMBERSHIP}/${ROUTE_USER_ORDERS}`]);
  }

  onTabShoppingListChanged(event: MatTabChangeEvent): void {
    this.selectedTabShoppingList = this._homeScreenData.tabShoppingLists[event.index];
  }

  onClickShoppingListSeeAllBtn(): void {
    const route =
      this.selectedTabShoppingList.customId === 'LAST_ORDERS'
        ? `${ROUTE_MEMBERSHIP}/${ROUTE_USER_ORDERS}`
        : '/' + this.selectedTabShoppingList.prettyName;
    this._router.navigate([route], {
      state: { referrerEventId: this.selectedTabShoppingList.referrerEventId },
    });
  }

  onClickShoppingList(shoppingList: ShoppingListDTO): void {
    this._router.navigate(['/' + shoppingList.prettyName], {
      state: { referrerEventId: shoppingList.referrerEventId },
    });
  }

  onClickCategory(category: CategoryDTO): void {
    this._router.navigate([category.prettyName]);
  }

  onClickSeeAllCategories(): void {
    this._router.navigate([ROUTE_CATEGORIES]);
  }

  onOpenOrderRateDialog(order: SimpleOrderFeedbackDTO): void {
    const dialogRef = this._matDialog.open(OrderRateDialog, {
      panelClass: ['wide-dialog', 'mobile-modal', 'order-rate-dialog'],
      data: order,
    });

    dialogRef.componentInstance.ratingFormSubmit.subscribe((orderId: number) => {
      this._homeScreenData.unratedOrders = this._homeScreenData.unratedOrders.filter(
        (unratedOrder: SimpleOrderFeedbackDTO) => {
          return unratedOrder.orderId !== orderId;
        }
      );
    });
    this._cdr.detectChanges();
  }

  onInsideViewPort(): void {
    this.bannerVisible = true;
  }

  onOutsideViewPort(): void {
    this.bannerVisible = false;
  }

  trackByFnShoppingList(_index: number, product: StoreProductInfoDTO): number {
    return product.id;
  }

  trackByFnMainShoppingList(_index: number, shoppingList: ShoppingListDTO): number {
    return shoppingList.id;
  }

  trackByTopLevelCategories(_index: number, category: CategoryDTO): number {
    return category.id;
  }

  trackByUnratedOrders(_index: number, order: SimpleOrderFeedbackDTO): number {
    return order.orderId;
  }

  onClickMoneyRegistration(): void {
    this._router.navigate([ROUTE_MONEY_REGISTER]);
  }

  onClickBanner(banner: BannerDTO, event: MouseEvent): void {
    event.preventDefault();
    if (banner.callToActionUrl.includes(this.moneyGoldText)) {
      location.href = banner.callToActionUrl;
      return;
    }
    this._router.navigate([banner.callToActionUrl], {
      state: { referrerEventId: banner.referrerEventId },
    });
  }

  fetchHomeScreen(): Observable<AppResponseHomeScreenDTO> {
    return this._homeScreenControllerService.getHomeScreen();
  }

  scrollTo(container: MatTabGroup | HTMLElement, direction: 'left' | 'right'): void {
    // this function handles prev, next button functionality, uses scrollBy method.
    // it separates logic with checking containers whether items is in matTab or HTMLElement.

    if (container instanceof MatTabGroup) {
      const offsetWidth = container._tabBodyWrapper.nativeElement.offsetWidth;
      const selectedMatTabBody = Array.from(container._tabBodyWrapper.nativeElement.children).filter(
        (element: HTMLElement) => {
          return element.classList.contains('mat-mdc-tab-body-active');
        }
      )[0] as HTMLElement;

      selectedMatTabBody.firstElementChild.scrollBy({
        behavior: 'smooth',
        left: direction === 'left' ? -offsetWidth : offsetWidth,
      });
    }

    if (container instanceof HTMLElement) {
      const offsetWidth = container.offsetWidth;
      container.scrollBy({
        behavior: 'smooth',
        left: direction === 'left' ? -offsetWidth : offsetWidth,
      });
    }
    this._cdr.detectChanges();
  }

  handlePrevButtonsOpacities(): void {
    // this function handles prev button opacity.
    // it toggles opacity style of prev button when container of sm-list-page-item reach left and so on.

    this.listItemContainers._results.forEach((container) => {
      if (container instanceof MatTabGroup) {
        if (container._tabBodyWrapper?.nativeElement?.children) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Array.from(container._tabBodyWrapper.nativeElement.children).forEach((element: any) => {
            const scrollableContainer = element.firstChild;
            scrollableContainer.onscroll = (): void => {
              if (scrollableContainer.firstChild.firstChild) {
                if (scrollableContainer.scrollLeft === 0) {
                  scrollableContainer.firstChild.firstChild.style.opacity = 0.4;
                } else {
                  scrollableContainer.firstChild.firstChild.style.opacity = 1;
                }
              }
            };
          });
        }
      }
      if (container instanceof ElementRef) {
        const scrollableContainer = container.nativeElement;
        scrollableContainer.onscroll = (): void => {
          if (scrollableContainer.scrollLeft === 0) {
            scrollableContainer.parentElement.firstChild.style.opacity = 0.4;
          } else {
            scrollableContainer.parentElement.firstChild.style.opacity = 1;
          }
        };
      }
    });
  }

  private _initializePage(): void {
    this._loadingIndicatorService.start();
    this._loading = true;
    this._subscribeToCart();
    this._subscribeToAuthenticate();
    this._subscribeToAppState();

    combineLatest([
      this.fetchHomeScreen(),
      this._userService.user$,
      this._productCategoryTreeService.getTopLevelCategories(),
    ])
      .pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        finalize(() => {
          this._loading = false;
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((response) => {
        this._loading = false;
        this._loadingIndicatorService.stop();
        this._homeScreenData = response[0]?.data;
        this.selectedTabShoppingList = this._homeScreenData.tabShoppingLists[0];
        this._moneyUser = response[1]?.crmStatus === 'VERIFIED';
        this._topLevelCategories = response[2]?.data;
        this._cartService.setCart(this._homeScreenData.cartInfo);
        this._cdr.detectChanges();
        this.handlePrevButtonsOpacities();
        this._pageInitialized = true;
      });
    this._titleService.setTitle('Migros Sanal Market: Online Market Alışverişi');
    this._metaService.updateTag({
      name: 'description',
      content:
        'Geniş ürün yelpazesi, en uygun fiyatlı ürünleri ve aynı gün teslimat fırsatıyla online market alışverişinizde Migros Sanal Market size iyi gelecek!',
    });
  }

  private _subscribeToCart(): void {
    this._cartService.cart$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((cartInfo) => {
      this._cartInfo = cartInfo;
      this._cdr.detectChanges();
    });
  }

  private _subscribeToAuthenticate(): void {
    this._userService.isAuthenticated$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((authenticated) => {
      this.isAuthenticated = authenticated;
    });
  }

  private _subscribeToLocation(): void {
    this._locationService
      .getLocationInfo$()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter(() => this._pageInitialized)
      )
      .subscribe(() => {
        this._initializePage();
      });
  }

  private sendGtmPageViewEvent(pageComponentName: string, pageTitle: string): void {
    this.gtmService.sendPageView({
      event: `virtualPageview${pageComponentName}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: pageTitle,
      virtualPageName: pageComponentName,
    });
  }

  private _subscribeToAppState(): void {
    this._appStateService
      .getPortfolio$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((portfolio) => {
        this._portfolio = portfolio;
      });
  }
}
