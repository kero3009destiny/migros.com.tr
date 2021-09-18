import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { AppStateService, PortfolioEnum, UserService } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { CartInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { DeliveryOptionsModalComponent } from '../../../delivery';
import { ROUTE_CAMPAIGNS, ROUTE_CART, ROUTE_CATEGORIES, ROUTE_HOME, ROUTE_MEMBERSHIP } from '../../../routes';

interface MobileNavItem {
  name: string;
  passiveIcon: string;
  activeIcon: string;
  link: string;
}

@Component({
  selector: 'sm-mobile-bottom-nav',
  templateUrl: './mobile-bottom-nav.component.html',
  styleUrls: ['./mobile-bottom-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileBottomNavComponent extends SubscriptionAbstract {
  readonly DEFAULT_NAV_ITEMS: MobileNavItem[] = [
    {
      name: 'Anasayfa',
      passiveIcon: '/assets/icons/bottom-navigation/home-passive.svg',
      activeIcon: '/assets/icons/bottom-navigation/home-active.svg',
      link: ROUTE_HOME,
    },
    {
      name: 'Kategoriler',
      passiveIcon: '/assets/icons/bottom-navigation/search-passive.svg',
      activeIcon: '/assets/icons/bottom-navigation/search-active.svg',
      link: ROUTE_CATEGORIES,
    },
    {
      name: 'Sepetim',
      passiveIcon: '/assets/icons/bottom-navigation/cart-passive.svg',
      activeIcon: '/assets/icons/bottom-navigation/cart-active.svg',
      link: ROUTE_CART,
    },
    {
      name: 'Kampanyalar',
      passiveIcon: '/assets/icons/bottom-navigation/campaign-passive.svg',
      activeIcon: '/assets/icons/bottom-navigation/campaign-active.svg',
      link: ROUTE_CAMPAIGNS,
    },
    {
      name: 'Hesabım',
      passiveIcon: '/assets/icons/bottom-navigation/profile-passive.svg',
      activeIcon: '/assets/icons/bottom-navigation/profile-active.svg',
      link: ROUTE_MEMBERSHIP,
    },
  ];
  readonly KURBAN_NAV_ITEMS: MobileNavItem[] = [
    {
      name: 'Anasayfa',
      passiveIcon: '/assets/icons/bottom-navigation/home-passive.svg',
      activeIcon: '/assets/icons/bottom-navigation/home-active.svg',
      link: ROUTE_HOME,
    },
    {
      name: 'Hesabım',
      passiveIcon: '/assets/icons/bottom-navigation/profile-passive.svg',
      activeIcon: '/assets/icons/bottom-navigation/profile-active.svg',
      link: ROUTE_MEMBERSHIP,
    },
  ];
  NAV_ITEMS: MobileNavItem[] = [];
  private cartInfo: CartInfoDTO;
  private _isAvailable: boolean;
  private _hasDistrictId: boolean;

  constructor(
    private _appState: AppStateService,
    private cartService: CartService,
    private _changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private _matDialog: MatDialog,
    private _userService: UserService
  ) {
    super();
    this.subscribeToAppState();
    this.subscribeToCart();
    this.subscribeToUserService();
  }

  isAvailable(): boolean {
    return this._isAvailable;
  }

  isCartEmpty(name: string): boolean {
    if (name === 'Sepetim') {
      return this.cartInfo.itemInfos?.length === 0;
    }
    return true;
  }

  getCartRevenue(): number {
    return this.cartInfo.revenue;
  }

  getCartLength(): number {
    return this.cartInfo.itemInfos?.length;
  }

  onClickNavItem(navItem: MobileNavItem): void {
    if (navItem.name === 'Anasayfa') {
      this.router.navigate([ROUTE_HOME]);
    }
    if (navItem.name === 'Kategoriler') {
      this.router.navigate([ROUTE_CATEGORIES]);
    }
    if (navItem.name === 'Sepetim') {
      if (!this._hasDistrictId) {
        this._matDialog.open(DeliveryOptionsModalComponent, {
          panelClass: ['delivery-options-modal__container', 'mobile-modal'],
          id: 'modal-component',
          data: {
            title: 'Teslimat Yöntemini Belirle',
          },
        });
        return;
      }
      this.router.navigateByUrl(ROUTE_CART);
    }
    if (navItem.name === 'Kampanyalar') {
      this.router.navigate([ROUTE_CAMPAIGNS]);
    }
    if (navItem.name === 'Hesabım') {
      this.router.navigate([ROUTE_MEMBERSHIP]);
    }
  }

  private subscribeToCart(): void {
    this.cartService.cart$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((cartInfo) => {
      this.cartInfo = cartInfo;
      this._changeDetectorRef.markForCheck();
    });
  }

  private subscribeToUserService(): void {
    this._userService.hasDistrictId$
      .pipe(takeUntil(this.getDestroyInterceptor()), distinctUntilChanged())
      .subscribe((hasDistrictId) => {
        this._hasDistrictId = hasDistrictId;
      });
  }

  private subscribeToAppState(): void {
    this._appState
      .getMobileBottomNavVisibility()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((visibility: boolean) => {
        this._isAvailable = visibility;
        this._changeDetectorRef.markForCheck();
      });
    this._appState.getPortfolio$().subscribe((portfolio) => {
      switch (portfolio) {
        case PortfolioEnum.KURBAN:
          this.NAV_ITEMS = this.KURBAN_NAV_ITEMS;
          break;
        default:
          this.NAV_ITEMS = this.DEFAULT_NAV_ITEMS;
      }
      this._changeDetectorRef.markForCheck();
    });
  }
}
