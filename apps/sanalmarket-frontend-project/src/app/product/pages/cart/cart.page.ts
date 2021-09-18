import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { MatListOption, MatSelectionList } from '@angular/material-experimental/mdc-list';
import { Router } from '@angular/router';

import { AppStateService, GtmService, PortfolioEnum, UserService } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { BannerTypeModel, GtmProductModel, presenceAnimationTrigger, SubscriptionAbstract } from '@fe-commerce/shared';
import { SegmentifyRecommendationService } from '@fe-commerce/product';

import { filter, takeUntil } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons/faInfoCircle';
import {
  BannerResponseDTO,
  CartFormBean,
  CartInfoDTO,
  CartItemInfoDTO,
  CheckoutDTO,
  CheckoutInfoDTO,
  StoreProductInfoDTO,
  UserStateInfo,
} from '@migroscomtr/sanalmarket-angular';

import { AnonymousLoginDialogComponent } from '../../../core/dialogs';
import { ROUTE_HOME } from '../../../routes';
import { ProductActionsConfirmDialogComponent } from '../../components/product-actions-confirm-dialog/product-actions-confirm-dialog.component';

@Component({
  selector: 'sm-cart-page',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  animations: [presenceAnimationTrigger],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SegmentifyRecommendationService],
})
export class CartPage extends SubscriptionAbstract implements OnInit, OnDestroy {
  @ViewChild('cartList') cartList: MatSelectionList;

  public segmentifyProducts: StoreProductInfoDTO[] = [];

  private _checkoutInfo: CheckoutInfoDTO;
  private _isLoading = true;
  private _cartInfo: CartInfoDTO;
  private _isCartEditMode: boolean;
  private _alternativeProductChoice: CheckoutDTO.AlternativeProductChoiceEnum = 'UP_TO_CUSTOMER';
  private _isAdditionalOrderActive: boolean;
  private _infoIcon = faInfoCircle;
  private _topBanners: BannerResponseDTO[] = [];
  private _sideBanners: BannerResponseDTO[] = [];
  private _isGtmEventSent = false;
  private _isAnonymousUser = false;
  private _isAlternativeProductChoiceVisible = false;
  private topBannerVisible: boolean;
  private sideBanner1Visible: boolean;
  private sideBanner2Visible: boolean;

  constructor(
    private _cartService: CartService,
    private _matDialog: MatDialog,
    private _userService: UserService,
    private _gtmService: GtmService,
    private _router: Router,
    private _segmentifyService: SegmentifyRecommendationService,
    private _checkoutService: CheckoutService,
    private _appState: AppStateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this._appState.setFooterLinksVisibility(false);
    this._appState.setMobileBottomNavVisibility(false);
    this._appState.setFooterLite(true);
    this.subscribeToAppState();
    this.subscribeToCart();
    this.subscribeToUserState();
    this.subscribeToSegmentify();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._appState.setFooterLinksVisibility(true);
    this._appState.setMobileBottomNavVisibility(true);
    this._appState.setFooterLite(false);
  }

  getTopBanners(): BannerResponseDTO[] {
    return this._topBanners;
  }

  getSideBanners(): BannerResponseDTO[] {
    return this._sideBanners;
  }

  getCheckoutInfo(): CheckoutInfoDTO {
    return this._checkoutInfo;
  }

  getItemInfos(): CartItemInfoDTO[] {
    return this._cartInfo?.itemInfos;
  }

  getCartInfo(): CartInfoDTO {
    return this._cartInfo;
  }

  getSelectedItems(): MatListOption[] {
    return this.cartList?.selectedOptions?.selected;
  }

  getUpdateCartText(): string {
    return this._isCartEditMode ? 'Vazgeç' : 'Sepeti Düzenle';
  }

  getInfoIcon(): IconProp {
    return this._infoIcon;
  }

  getPriceLeftForCheckout(): number | undefined {
    return this._cartInfo?.priceLeftForCheckout;
  }

  getAlternativeProductChoice(): CheckoutDTO.AlternativeProductChoiceEnum {
    return this._alternativeProductChoice;
  }

  isLoading(): boolean {
    return this._isLoading;
  }

  isCartEditMode(): boolean {
    return this._isCartEditMode;
  }

  isCartEmpty(): boolean {
    return !this._cartInfo?.itemInfos?.length;
  }

  isAnyItemSelected(): boolean {
    return this.getSelectedItems()?.length > 0;
  }

  isMinimumRequiredRevenueAcquired(): boolean {
    return this._cartInfo && (this._cartInfo.priceLeftForCheckout <= 0 || this._isAdditionalOrderActive);
  }

  isBannersEmpty(type: BannerTypeModel): boolean {
    return type === 'top' ? this._topBanners.length === 0 : this._sideBanners.length === 0;
  }

  isAlternativeProductChoiceVisible(): boolean {
    return this._isAlternativeProductChoiceVisible;
  }

  isBannerVisible(type: BannerTypeModel, index: number): boolean {
    if (type === 'top') {
      return this.topBannerVisible;
    } else {
      if (index === 0) {
        return this.sideBanner1Visible;
      }
      if (index === 1) {
        return this.sideBanner2Visible;
      }
      return;
    }
  }

  onClickStartShopping(): void {
    this._router.navigate([ROUTE_HOME]);
  }

  onSubmit(): void {
    if (!this.isMinimumRequiredRevenueAcquired()) {
      window.scroll(0, 0);
      return;
    }

    if (this._isAnonymousUser) {
      this.openAnonymousLoginDialog();
    } else {
      this.makeCreateCheckout({
        alternativeProductChoice: this._alternativeProductChoice,
        bagSelected: true,
      });
    }
  }

  onChangeAlternativeProductChoice($event: 'NO_ALTERNATIVE' | 'UP_TO_CUSTOMER' | 'UP_TO_PERSONNEL'): void {
    this._alternativeProductChoice = $event;
    this._changeDetectorRef.markForCheck();
  }

  onInsideViewPort(bannerType: BannerTypeModel, index: number): void {
    if (bannerType === 'top') {
      this.topBannerVisible = true;
    }
    if (bannerType === 'side') {
      if (index === 0) {
        this.sideBanner1Visible = true;
      }
      if (index === 1) {
        this.sideBanner2Visible = true;
      }
    }
  }

  onOutsideViewPort(bannerType: BannerTypeModel, index: number): void {
    if (bannerType === 'top') {
      this.topBannerVisible = false;
    }
    if (bannerType === 'side') {
      if (index === 0) {
        this.sideBanner1Visible = false;
      }
      if (index === 1) {
        this.sideBanner2Visible = false;
      }
    }
  }

  updateCart(): void {
    this._isCartEditMode = !this._isCartEditMode;
    this._changeDetectorRef.markForCheck();
  }

  deleteSelectedItems(isAllItemsSelected = false): void {
    const dialogRef = this._matDialog.open(ProductActionsConfirmDialogComponent, {
      data: {
        content: isAllItemsSelected
          ? 'Tüm ürünleri silmek istediğine emin misin?'
          : 'Seçili ürünleri silmek istediğine emin misin?',
      },
      panelClass: 'wide-dialog',
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((action) => !!action)
      )
      .subscribe(() => {
        const referrerId = isAllItemsSelected
          ? this.getCartInfo().itemInfos[0]?.referrerEventId
          : this.cartList.selectedOptions.selected[0]?.value?.referrerEventId;
        const newList = isAllItemsSelected
          ? this.getCartInfo().itemInfos.map((itemInfo: CartItemInfoDTO) => {
              const { product } = itemInfo;
              const { note, productId, storeId, unit } = itemInfo.item;
              return { amount: 0, note, productId, storeId, unit, product };
            })
          : this.cartList.selectedOptions.selected
              .map((selectedOption: MatListOption) => selectedOption.value)
              .map((itemInfo: CartItemInfoDTO) => {
                const { product } = itemInfo;
                const { note, productId, storeId, unit } = itemInfo.item;
                return { amount: 0, note, productId, storeId, unit, product };
              });
        this._isCartEditMode = false;
        this._cartService.updateAll(newList, referrerId, true, true);
        this._changeDetectorRef.markForCheck();
      });
  }

  selectAll(): void {
    this.cartList.selectAll();
  }

  private makeCreateCheckout(cartFormBean: CartFormBean): void {
    if (!this._isAdditionalOrderActive) {
      this.createCheckout(cartFormBean);
    } else {
      this.createAdditionalCheckout();
    }
  }

  private createAdditionalCheckout(): void {
    this._checkoutService.newDerivedCheckout().subscribe((data) => {
      this._checkoutService.updateCheckout(data);
      this._router.navigate([`/siparis/odeme/${data.line.id}`]);
    });
  }

  private createCheckout(cartFormBean: CartFormBean): void {
    this._checkoutService.newCheckout(cartFormBean).subscribe((data) => {
      this._checkoutService.updateCheckout(data);
      this._router.navigate([`/siparis/adres/${data.line.id}`]);
    });
  }

  private sendGtmPageViewEvent(cartItem: CartItemInfoDTO[], lineId): void {
    const gtmProducts: GtmProductModel[] = cartItem.reduce(this.reduceGTMProducts.bind(this), []);

    this._gtmService.sendPageView({
      event: 'virtualPageviewCart',
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Sepetim | Sanalmarket',
      virtualPageName: 'Cart',
      objectId: lineId,
      products: gtmProducts || [],
    });
  }

  private reduceGTMProducts(acc, cartItem, index): void {
    const gtmProduct = this._gtmService.generateGtmProductData(cartItem.product, index, 'cart', cartItem.item.amount);
    acc.push(gtmProduct);
    return acc;
  }

  private subscribeToSegmentify(): void {
    this.segmentifyProducts = [];
    this._segmentifyService.getCartRecommendations().subscribe((data) => {
      this.segmentifyProducts = data;
      this._changeDetectorRef.detectChanges();
    });
  }

  private subscribeToUserState(): void {
    this._userService
      .getUserState()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((userState) => {
        this._isAdditionalOrderActive = userState.cartMode === UserStateInfo.CartModeEnum.Additional;
        this._changeDetectorRef.detectChanges();
      });
  }

  private subscribeToCart(): void {
    this._cartService.getCartInfoScreen().subscribe((data) => {
      this._topBanners = data.bannersMap.CART_PAGE_TOP ?? [];
      this._sideBanners = [...(data.bannersMap.CART_PAGE_SIDE_1 ?? []), ...(data.bannersMap.CART_PAGE_SIDE_2 ?? [])];
    });

    this._cartService.cart$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((cartInfo) => !!cartInfo.line)
      )
      .subscribe((cartInfo) => {
        this._cartInfo = cartInfo;
        this._isAnonymousUser = cartInfo.line.anonymous;

        if (!this._cartInfo.itemInfos.length) {
          this._isCartEditMode = false;
        }
        if (!this._isGtmEventSent) {
          this.sendGtmPageViewEvent(cartInfo.itemInfos, cartInfo.line.id);
          this._isGtmEventSent = true;
        }
        this._isLoading = false;
        this._changeDetectorRef.detectChanges();
      });
  }

  private openAnonymousLoginDialog(): void {
    const dialogRef = this._matDialog.open(AnonymousLoginDialogComponent, {
      panelClass: ['wide-dialog', 'mobile-modal'],
      closeOnNavigation: true,
    });

    dialogRef
      .afterClosed()
      .pipe(filter((isAnonymous) => isAnonymous))
      .subscribe(() => {
        this._router
          .navigate(['/teslimat-adresi'], {
            queryParams: { alternativeProductChoice: this._alternativeProductChoice },
          })
          .then(() => this._changeDetectorRef.detectChanges());
      });
  }

  private subscribeToAppState(): void {
    this._appState
      .getPortfolio$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((portfolio) => {
        this._isAlternativeProductChoiceVisible = portfolio === PortfolioEnum.MARKET;
      });
  }
}
