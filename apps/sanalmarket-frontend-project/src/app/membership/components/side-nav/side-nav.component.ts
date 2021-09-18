import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { AuthService } from '@fe-commerce/auth';
import { EnvService } from '@fe-commerce/env-service';
import {
  AgreementDialogComponent,
  AppStateService,
  LoggingService,
  PortfolioEnum,
  UserService,
} from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';
import { TrackOrderService } from '@fe-commerce/membership';

import { takeUntil } from 'rxjs/operators';

import { faExternalLink } from '@fortawesome/pro-light-svg-icons';
import {
  faAddressBook,
  faArrowCircleRight,
  faBagsShopping,
  faChevronRight,
  faGiftCard,
  faHeart,
  faHeartbeat,
  faMapMarkedAlt,
  faUserAlt,
  faUserCircle,
  faUserCog,
  IconDefinition,
} from '@fortawesome/pro-regular-svg-icons';
import { faPhoneAlt } from '@fortawesome/pro-solid-svg-icons';
import { AcceptAgreementRequest, OrderAnonymousRestControllerService, UserDTO } from '@migroscomtr/sanalmarket-angular';

import {
  ROUTE_DELIVERY_OPTIONS,
  ROUTE_FAVORITE_PRODUCTS,
  ROUTE_HEALTHY_LIFE,
  ROUTE_LOGIN,
  ROUTE_MEMBERSHIP,
  ROUTE_MEMBERSHIP_INFORMATION,
  ROUTE_POINTS,
  ROUTE_SETTINGS,
  ROUTE_USER_ADDRESSES,
  ROUTE_USER_ORDERS,
} from '../../../routes';

import AcceptedAgreementsEnum = AcceptAgreementRequest.AcceptedAgreementsEnum;

@Component({
  selector: 'sm-membership-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent extends SubscriptionAbstract implements OnInit {
  readonly personalDataAgreementKey = 'PERSONAL_DATA_AGREEMENT';
  userAltIcon: IconDefinition = faUserAlt;
  mapMarkedAltIcon: IconDefinition = faMapMarkedAlt;
  addressBookIcon: IconDefinition = faAddressBook;
  bagsShoppingIcon: IconDefinition = faBagsShopping;
  heartIcon: IconDefinition = faHeart;
  giftCardIcon: IconDefinition = faGiftCard;
  heartbeatIcon: IconDefinition = faHeartbeat;
  userCogIcon: IconDefinition = faUserCog;
  userCircleIcon: IconDefinition = faUserCircle;
  chevronRightIcon: IconDefinition = faChevronRight;
  phoneIcon: IconDefinition = faPhoneAlt;
  externalLinkIcon: IconDefinition = faExternalLink;
  arrowIcon: IconDefinition = faArrowCircleRight;
  private user: UserDTO;
  private userMoneyPoints: number;
  private userDistrictName: string;
  private _isUserLoggedIn: boolean;
  private _portfolio: PortfolioEnum;
  constructor(
    private userService: UserService,
    private authService: AuthService,
    public agreementDialog: MatDialog,
    private ngZone: NgZone,
    private envService: EnvService,
    private _appStateService: AppStateService,
    private _loggingService: LoggingService,
    private router: Router,
    private _dialog: MatDialog,
    private _orderAnonymousRestControllerService: OrderAnonymousRestControllerService,
    private _trackOrderService: TrackOrderService
  ) {
    super();
  }

  ngOnInit(): void {
    this.userService.user$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((user) => {
      this.user = user;
    });
    this.userService
      .getUserPoints()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((userPoints) => {
        this.userMoneyPoints = userPoints?.['MONEY_POINT']?.value;
      });
    this.userService.districtName$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((districtName) => {
      this.userDistrictName = districtName;
    });
    this.userService.isAuthenticated$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((isLoggedIn) => {
      this._isUserLoggedIn = isLoggedIn;
      isLoggedIn && this.ngZone.run(() => this.userService.fetchUserPoints());
    });

    this._portfolio = this._appStateService.getPortfolio();
  }

  onClickLogout(): void {
    this.authService.logout();
  }

  getUserName(): string {
    return (this.user?.firstName ?? '') + ' ' + (this.user?.lastName ?? '');
  }

  isUserEmailDefined(): boolean {
    return !!this.user?.email;
  }

  getUserEmail(): string {
    return this.user?.email ?? '';
  }

  getUserMoneyPoints(): number {
    return this.userMoneyPoints ?? 0;
  }

  getUserDistrictName(): string | undefined {
    return this.userDistrictName;
  }

  isUserLoggedIn(): boolean {
    return !!this._isUserLoggedIn;
  }

  isCrmVerified(): boolean {
    return this.user?.crmStatus === 'VERIFIED';
  }

  isSaglikliYasamTabVisible(): boolean {
    return this._portfolio === PortfolioEnum.MARKET;
  }

  makeMembershipChildRoute(route: string): string {
    return '/' + ROUTE_MEMBERSHIP + '/' + route;
  }

  getServiceAreaRoute(): string {
    return '/' + ROUTE_DELIVERY_OPTIONS;
  }

  getUserAddressesRoute(): string {
    return this.makeMembershipChildRoute(ROUTE_USER_ADDRESSES);
  }

  getUserOrdersRoute(): string {
    return this.makeMembershipChildRoute(ROUTE_USER_ORDERS);
  }

  getFavouriteProductsRoute(): string {
    return this.makeMembershipChildRoute(ROUTE_FAVORITE_PRODUCTS);
  }

  getUserPointsRoute(): string {
    return this.makeMembershipChildRoute(ROUTE_POINTS);
  }

  getHealthyLifeRoute(): string {
    return this.makeMembershipChildRoute(ROUTE_HEALTHY_LIFE);
  }

  getSettingsRoute(): string {
    return this.makeMembershipChildRoute(ROUTE_SETTINGS);
  }

  getLogInRoute(): string {
    return '/' + ROUTE_LOGIN;
  }

  getOrderTrackingRoute(): void {
    this._trackOrderService.openTrackOrderModal();
  }

  getMembershipInformation(): string {
    return this.makeMembershipChildRoute(ROUTE_MEMBERSHIP_INFORMATION);
  }

  onAgreementClick(agreementType: AcceptedAgreementsEnum): void {
    this.agreementDialog.open(AgreementDialogComponent, {
      panelClass: 'wide-dialog',
      data: { type: agreementType },
      autoFocus: false,
    });
  }

  onClickPersonalDataAgreement(): void {
    this.onAgreementClick(this.personalDataAgreementKey);
  }

  isPortfolioKurban(): boolean {
    return this._portfolio === PortfolioEnum.KURBAN;
  }

  isPortfolioHemen(): boolean {
    return this._portfolio === PortfolioEnum.HEMEN;
  }

  isPortfolioMarket(): boolean {
    this._portfolio = this._appStateService.getPortfolio();
    return this._portfolio === PortfolioEnum.MARKET;
  }
}
