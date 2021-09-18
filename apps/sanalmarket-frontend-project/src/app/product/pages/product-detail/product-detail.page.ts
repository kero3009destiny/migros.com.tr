import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { AppStateService, Browser, GtmService, JsonLdService, ProductService, UserService } from '@fe-commerce/core';
import { LocationService } from '@fe-commerce/delivery';
import { CartService } from '@fe-commerce/line-cart';
import {
  BreadcrumbModel,
  GtmProductModel,
  MaxAmountInfoModel,
  ProductUnitModel,
  SubscriptionAbstract,
} from '@fe-commerce/shared';
import { SegmentifyRecommendationService } from '@fe-commerce/product';

import { filter, switchMap, takeUntil } from 'rxjs/operators';

import { faArrowLeft, faChevronRight } from '@fortawesome/pro-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faHeart as faHeartEmpty } from '@fortawesome/pro-light-svg-icons';
import { faEdit } from '@fortawesome/pro-regular-svg-icons/faEdit';
import { faHeart as faHearthFull } from '@fortawesome/pro-solid-svg-icons';
import {
  CartItemInfoDTO,
  OrderItemInfo,
  PageMetaData,
  ProductScreenDTO,
  StoreProductInfoDTO,
} from '@migroscomtr/sanalmarket-angular';

import { ProductFeedbackDialogComponent } from '../../components/product-feedback-dialog/product-feedback-dialog.component';
import { ProductImagesDialogComponent } from '../../components/product-images-dialog/product-images-dialog.component';

import StatusEnum = StoreProductInfoDTO.StatusEnum;

@Component({
  selector: 'sm-product-detail-page',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [SegmentifyRecommendationService],
})
export class ProductDetailPage extends SubscriptionAbstract implements OnInit, OnDestroy {
  public segmentifySimilarProducts: StoreProductInfoDTO[] = [];
  public segmentifyRelatedProducts: StoreProductInfoDTO[] = [];
  public itemInfo: OrderItemInfo;
  public backIcon = faArrowLeft;

  private _product: StoreProductInfoDTO;
  private _breadcrumb: BreadcrumbModel[];
  private _isFavourite = false;
  private _cartItem: CartItemInfoDTO;
  private _activeIndex = 0;
  private _dsaText: string;
  private _selectedUnit: ProductUnitModel;
  private _switchUnit: ProductUnitModel;
  private _cartAmount = 0;
  private _isAuthenticated = false;
  private _isOpenMobileAppPopup = true;
  private _pageInitialized = false;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _appStateService: AppStateService,
    private _productService: ProductService,
    private _locationService: LocationService,
    private _cartService: CartService,
    private _cdr: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private _router: Router,
    private _gtmService: GtmService,
    private _userService: UserService,
    private _jsonLdService: JsonLdService,
    private _titleService: Title,
    private _metaService: Meta,
    private _segmentifyService: SegmentifyRecommendationService,
    private _location: Location
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToActivatedRoute();
    this.subscribeToUserService();
    this.subscribeToLocationInfo();
    this.subscribeToSegmentify();
    this.subscribeToMobileAppPopup();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._jsonLdService.removeSchema();
  }

  getProduct(): StoreProductInfoDTO {
    return this._product;
  }

  getCartAmount(): number {
    return this._cartAmount;
  }

  getBreadcrumbs(): BreadcrumbModel[] {
    return this._breadcrumb;
  }

  getUnitLabel(unit: ProductUnitModel): string {
    return unit === 'PIECE' || unit === 'PACKET' ? 'adet' : 'kg';
  }

  getDsaText(): string {
    return this._dsaText;
  }

  getHeartEmptyIcon(): IconProp {
    return faHeartEmpty;
  }

  getHeartFullIcon(): IconProp {
    return faHearthFull;
  }

  getUnit(): ProductUnitModel {
    return this.isAlternativeUnitSelected() ? this._product.alternativeUnit : this._product.unit;
  }

  getNoteIcon(): IconProp {
    return faEdit;
  }

  getNote(): string {
    return this._cartItem?.item.note;
  }

  getChevronRightIcon(): IconProp {
    return faChevronRight;
  }

  getCartItem(): CartItemInfoDTO {
    return this._cartItem;
  }

  getItemAmount(): number {
    return this._cartAmount;
  }

  getActiveIndex(): number {
    return this._activeIndex;
  }

  getIncrementAmount(): number {
    return this.isAlternativeUnitSelected()
      ? this._product.alternativeUnitIncrementAmount
      : this._product.incrementAmount;
  }

  getInitialIncrementAmount(): number {
    return this.isAlternativeUnitSelected()
      ? this._product.alternativeUnitInitialIncrementAmount
      : this._product.initialIncrementAmount;
  }

  getMaxAmount(): number {
    return this.isAlternativeUnitSelected() ? this._product.alternativeUnitMaxAmount : this._product.maxAmount;
  }

  getSelectedUnit(): ProductUnitModel {
    return this._selectedUnit;
  }

  getDiscountLabel(): string {
    return this._product.discounts[Object.keys(this._product.discounts)[0]][0];
  }

  hasAlternativeUnit(): boolean {
    return !!this._product.alternativeUnit;
  }

  hasDescription(): boolean {
    return !!this._product.properties;
  }

  isFavourite(): boolean {
    return this._isFavourite;
  }

  isProductNoteEmpty(): boolean {
    return !this._cartItem?.item.note;
  }

  isMobile(): boolean {
    return Browser.isMobile();
  }

  isInSale(): boolean {
    return this._product.status === StatusEnum.InSale;
  }

  isUserAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  isPropertiesEmpty(): boolean {
    return JSON.stringify(this._product.properties) === '{}';
  }

  isAlternativeUnitSelected(): boolean {
    return this.hasAlternativeUnit() && this._selectedUnit === this._product.alternativeUnit;
  }

  isDiscountVisible(): boolean {
    return Object.keys(this._product.discounts).length > 0;
  }

  isBadgesVisible(): boolean {
    return this._product.badges?.length > 0 || this._product.crmDiscountTags?.length > 0;
  }

  isOpenMobileAppPopup(): boolean {
    return this._isOpenMobileAppPopup;
  }

  onUpdate(amount: number, product: StoreProductInfoDTO): void {
    const { id, unit } = product;
    this._cartService.update({ productId: id, amount, unit }, product);
  }

  onChangeUnitSelection(matRadioChange: MatRadioChange): void {
    const currentUnit = matRadioChange.value;

    // If item is not in cart, simply just switch the selectedUnit and the rest is handled by product-actions component
    if (!this._cartAmount) {
      this._selectedUnit = currentUnit;
      this._cdr.markForCheck();
      return;
    }

    // If item is in the cart, we need to manually update the cart if user switch units
    // In order to make successful switch between units, we need to first wait for the cart update
    // and then we set selectedUnit based on cartItem's unit to make sure we set the cart according to current unit
    const estimatedPieceWeightByKg = this._product.alternativeUnitValue / 1000;
    let amount;
    if (currentUnit === 'GRAM') {
      amount = this._cartAmount * estimatedPieceWeightByKg * 1000;
    } else {
      amount = this._cartAmount / 1000 / estimatedPieceWeightByKg;

      // If unit is piece, we need to make sure amount that we send as request has no fraction
      // Since we handle selectedUnit variable after cart update request to make sure we have the same amount and unit as cart,
      // we need to keep a temporary unit called switchUnit
      if (amount < 1) {
        amount = 0;
        this._switchUnit = currentUnit;
      }
    }

    this._cartService.update(
      { productId: this._product.id, amount, unit: currentUnit },
      this._product,
      this._product.referrerEventId,
      false,
      false
    );
    this._cdr.markForCheck();
  }

  onClickRemoveFavouriteProduct(id: number): void {
    this._productService
      .removeFavouriteProduct(id)
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(() => {
        this._isFavourite = false;
        this._cdr.markForCheck();
      });
  }

  onClickAddFavouriteProduct(id: number): void {
    this._productService
      .addFavouriteProduct(id)
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(() => {
        this._isFavourite = true;
        this._gtmService.sendProductAddFavouriteEvent(id);
        this._cdr.markForCheck();
      });
  }

  onUpdateProductNote(): void {
    this._cartService.getCart(false);
  }

  onClickAdviceDialog(): void {
    this._matDialog.open(ProductFeedbackDialogComponent, {
      panelClass: ['wide-dialog', 'mobile-modal'],
      data: this._product.id,
    });
  }

  onClickProductImage(activeIndex): void {
    this._activeIndex = activeIndex;

    const configurations = Browser.isMobile()
      ? { maxWidth: '100vw', maxHeight: '100vh', height: '100%', width: '100%' }
      : {};
    this._matDialog.open(ProductImagesDialogComponent, {
      panelClass: ['product-images-dialog', 'mobile-modal'],
      data: {
        activeIndex,
        images: this._product.images,
      },
      ...configurations,
    });
  }

  onUpdateCart(amount: number): void {
    const { id } = this._product;
    this._cartService.update({ productId: id, amount, unit: this._selectedUnit }, this._product);
  }

  onReachMaxAmount(maxAmountInfo: MaxAmountInfoModel): void {
    this._cartService.maxAmountError(maxAmountInfo);
  }

  onClickBackButton(): void {
    this._location.back();
  }

  private onProductInitialized(): void {
    if (!this._pageInitialized) {
      this._selectedUnit = this._product.unit;
      this._cdr.markForCheck();
      this.generateBreadCrumbs(this._product);
      this.generateDSAText(this._product);
      this.subscribeToCartService();
      this.subscribeToProductService();
      this._jsonLdService.insertSchema(this._product);
      this._pageInitialized = true;
    }
    // event order should stay the same
    this.sendGtmPageViewEvent('ProductDetail', this._product);
    this.sendGtmEvent(this._product);
    // ****

    // reset segmentify data array
    this.segmentifySimilarProducts = [];
    this.segmentifyRelatedProducts = [];
  }

  private sendGtmEvent(product: StoreProductInfoDTO): void {
    const gtmProductObj: GtmProductModel = this._gtmService.generateGtmProductData(product, 0, 'productDetail');
    this._gtmService.sendProductDetail(gtmProductObj);
  }

  private sendGtmPageViewEvent(page, product): void {
    const gtmProduct: GtmProductModel = this._gtmService.generateGtmProductData(product, 0, 'productDetail');

    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: `${product.name} | Sanal Market`,
      virtualPageName: page,
      products: [gtmProduct],
      objectId: product.sku,
    });
  }

  private generateDSAText(product: StoreProductInfoDTO): void {
    const dsaText = product.categoryAscendants
      .slice(0) // Prevent mutating original list instead copy it
      .reverse()
      .map((currentItem) => {
        return currentItem.id;
      });

    dsaText.push(product.category.id);

    this._dsaText = dsaText.join('/');
    this._cdr.markForCheck();
  }

  private subscribeToCartService(): void {
    this._cartService.cartItems$.subscribe((cartItems) => {
      this._cartItem = cartItems && cartItems.find((cartItemInfo) => cartItemInfo.product.sku === this._product.sku);

      if (this._cartItem) {
        this._cartAmount = this._cartItem.item.amount;
        this._selectedUnit = this._cartItem.item.unit as ProductUnitModel;
      } else {
        this._cartAmount = 0;
        this._selectedUnit = this._switchUnit ?? this._product.unit;
        this._switchUnit = null;
      }
      this._cdr.markForCheck();
    });
  }

  private subscribeToProductService(): void {
    this._productService
      .getFavouriteProductIds()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((ids) => {
        this._isFavourite = ids.includes(this._product.id);
        this._cdr.markForCheck();
      });
  }

  private subscribeToActivatedRoute(): void {
    this._activatedRoute.paramMap.subscribe((_) => {
      if (this._activatedRoute.snapshot.data['extras']) {
        const screenInfo = this._activatedRoute.snapshot.data['extras'] as ProductScreenDTO;
        this._product = screenInfo.storeProductInfoDTO;
        this._cartService.setCart(screenInfo.cartInfoDTO);
        this._processMetaData(screenInfo.pageMetaData);
        this.onProductInitialized();
      }
    });
  }

  private subscribeToMobileAppPopup(): void {
    this._appStateService.getMobileAppPopupVisibility().subscribe((visible) => {
      this._isOpenMobileAppPopup = visible;
      this._cdr.detectChanges();
    });
  }

  private subscribeToLocationInfo(): void {
    this._locationService
      .getLocationInfo$()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter(() => !this._pageInitialized),
        switchMap(() => this._productService.get(this._product.id)),
        filter((product) => !!product)
      )
      .subscribe((product) => {
        this._product = product;
        this.onProductInitialized();
      });
  }

  private subscribeToSegmentify(): void {
    this._segmentifyService.getSimilarProducts().subscribe((data) => {
      this.segmentifySimilarProducts = data;
      this._cdr.detectChanges();
    });

    this._segmentifyService.getRelatedProducts().subscribe((data) => {
      this.segmentifyRelatedProducts = data;
      this._cdr.detectChanges();
    });
  }

  private generateBreadCrumbs(product: StoreProductInfoDTO): void {
    const breadcrumbList = product.categoryAscendants
      .slice(0)
      .reverse()
      .map((currentItem): BreadcrumbModel => {
        return {
          label: currentItem.name,
          // @ts-expect-error TODO Figure out why `prettyName` field is not generated
          url: currentItem.prettyName,
          referrerEventId: product.referrerEventId,
        };
      });

    breadcrumbList.push({
      label: product.category.name,
      // @ts-expect-error TODO Figure out why `prettyName` field is not generated
      url: `${product.category.prettyName}`,
      referrerEventId: product.referrerEventId,
    });

    breadcrumbList.push({
      label: product.name,
      url: `${product.prettyName}`,
      referrerEventId: product.referrerEventId,
    });

    this._breadcrumb = breadcrumbList;
  }

  private subscribeToUserService(): void {
    this._userService.isAuthenticated$.subscribe((isAuthenticated) => {
      this._isAuthenticated = isAuthenticated;
      this._cdr.markForCheck();
    });
  }

  private _processMetaData(metaData: PageMetaData): void {
    if (metaData.seoTitle) {
      this._titleService.setTitle(metaData.seoTitle);
    }
    if (metaData.seoDescription) {
      this._metaService.updateTag({ name: 'description', content: metaData.seoDescription });
    }
  }
}
