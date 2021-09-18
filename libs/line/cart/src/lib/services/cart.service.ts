import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { GtmService, LoadingIndicatorService, ReferrerEventService, UserService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';
import {
  findLatestRouteChild,
  FormatAmountPipe,
  FormatUnitPipe,
  MaxAmountInfoModel,
  SubscriptionAbstract,
  ToasterService,
  GtmProductModel,
  ProductUnitModel,
} from '@fe-commerce/shared';
import { DeliveryZoneService } from '@fe-commerce/delivery';

import { catchError, distinctUntilChanged, filter, finalize, map, skip, take, takeUntil, tap } from 'rxjs/operators';

import { BehaviorSubject, combineLatest, EMPTY, Observable, throwError } from 'rxjs';
import {
  CartCampaignDTO,
  CartInfoDTO,
  CartInfoScreenDTO,
  CartItemForm,
  CartItemInfoDTO,
  CartRestControllerService,
  CartScreenControllerService,
  SimpleProduct,
  SimpleProductDTO,
  StoreProductInfoDTO,
} from '@migroscomtr/sanalmarket-angular';

import { initialCartObject } from '../constants';
import { CartErrorModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CartService extends SubscriptionAbstract {
  private _cart = new BehaviorSubject<CartInfoDTO>(<CartInfoDTO>{ itemInfos: [] });
  private _cartError = new BehaviorSubject<CartErrorModel>(<CartErrorModel>{});
  private _cartItemInfos = new BehaviorSubject<CartItemInfoDTO[]>([]);
  private _cartCampaigns = new BehaviorSubject<CartCampaignDTO[]>([]);
  private _cartUpdateLocked = false;
  private _hasDistrict: boolean;
  private _anonymousCheckout = false;
  private _authenticated = false;

  constructor(
    private _cartScreenControllerService: CartScreenControllerService,
    private _cartRestService: CartRestControllerService,
    private _toasterService: ToasterService,
    private _gtmService: GtmService,
    private _formatUnit: FormatUnitPipe,
    private _formatAmount: FormatAmountPipe,
    private _userService: UserService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _envService: EnvService,
    private _referrerEventService: ReferrerEventService,
    private _deliveryZoneService: DeliveryZoneService
  ) {
    super();
    this.subscribeToUserAuthState();
  }

  get cart$() {
    return this._cart.asObservable();
  }

  get cartError$() {
    return this._cartError.asObservable();
  }

  get cartItems$() {
    return this._cartItemInfos.asObservable();
  }

  getCartCampaigns$(): Observable<CartCampaignDTO[]> {
    return this._cartCampaigns.asObservable();
  }

  subscribeToDistrictChange(): void {
    // Skip the initial cart fetching if the route has the corresponding settings
    combineLatest([
      this._router.events.pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((event) => event instanceof NavigationEnd),
        take(1)
      ),
      this._userService.districtId$.pipe(take(1)),
    ])
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        map(([, districtId]) => districtId),
        filter((districtId) => !!districtId),
        distinctUntilChanged(),
        filter(() => {
          const data = findLatestRouteChild(this._activatedRoute).snapshot?.data;
          const shouldSkipFetchingCart = data?.shouldSkipFetchingCart ?? false;
          return !shouldSkipFetchingCart;
        })
      )
      .subscribe(() => {
        this.getCart(false);
      });

    // Later district id changes must be captured by all routes
    this._userService.districtId$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        skip(1),
        filter((districtId) => !!districtId),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.getCart(false);
      });
    this._userService.hasDistrictId$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((hasDistrictId) => {
      this._hasDistrict = hasDistrictId;
    });
  }

  private callUpdateCartService(
    cartItemList: CartItemForm[],
    productIdList: number[],
    { beingUpdatedItem, cartItem, multiple, itemCount, rawProduct, isDelete = false },
    referrerEventId: string,
    isCartPage = false,
    showSuccessMessage = true
  ) {
    if (this._cartUpdateLocked) {
      return;
    }
    this._loadingIndicatorService.start();
    this._cartUpdateLocked = true;
    //
    this._referrerEventService.setObjectId(referrerEventId);
    //
    this._cartRestService
      .upsert({
        items: cartItemList,
        applyCrmDiscounts: isCartPage,
        applySpecialDiscounts: isCartPage,
        includeDeliveryFee: isCartPage,
      })
      .pipe(
        catchError((error) => {
          productIdList.forEach((productId) => this.errorHandler(error, productId));
          return throwError(error);
        }),
        map((response) => response.data),
        filter((data) => !!data),
        finalize(() => {
          this._loadingIndicatorService.stop();
          this._cartUpdateLocked = false;
        })
      )
      .subscribe((cartInfo: CartInfoDTO) => {
        this.callCartActionTypes({
          beingUpdatedItem,
          cartItem,
          multiple,
          itemCount,
          rawProduct,
          isDelete,
          showSuccessMessage,
        });
        this.emitCartInfoToSubscribers(cartInfo);
      });
  }

  private emitCartInfoToSubscribers(cartInfo: CartInfoDTO | null) {
    this._cart.next(cartInfo || initialCartObject);
    this._cartItemInfos.next(cartInfo?.itemInfos || []);
  }

  private errorHandler(error, productId?: number) {
    this._cartError.next({ error, productId });
  }

  getCartInfoScreen(): Observable<CartInfoScreenDTO> {
    this._loadingIndicatorService.start();
    return this._cartScreenControllerService.getCartInfoScreen().pipe(
      map((response) => response.data),
      filter((cartInfoScreenDTO) => !!cartInfoScreenDTO),
      tap((data) => {
        this.emitCartInfoToSubscribers(data.cartInfo);
        this._cartCampaigns.next([...data.specialDiscountCampaigns, ...data.skuPromoteCampaigns]);
      }),
      finalize(() => this._loadingIndicatorService.stop()),
      catchError((error) => {
        this.errorHandler(error, null);
        return EMPTY;
      })
    );
  }

  getCart(isCartPage = false): Observable<CartInfoDTO> {
    this._loadingIndicatorService.start();
    const cartObservable = this._cartRestService.get(isCartPage).pipe(
      map((response) => response.data),
      finalize(() => this._loadingIndicatorService.stop()),
      catchError((error) => {
        this.errorHandler(error, null);
        return EMPTY;
      })
    );
    cartObservable.subscribe((data) => {
      this.emitCartInfoToSubscribers(data);
    });
    return cartObservable;
  }

  setCart(cartInfo: CartInfoDTO): void {
    this.emitCartInfoToSubscribers(cartInfo);
  }

  update(
    cartItem: CartItemForm,
    rawProduct: SimpleProduct | SimpleProductDTO | StoreProductInfoDTO,
    referrerEventId?: string,
    isCartPage = false,
    showSuccessMessage = true
  ): void {
    const mcAnonymousConditions = !this._envService.hasDefaultDistrict && !this._hasDistrict && !this._authenticated;
    const tdAnonymousConditions =
      this._envService.hasDefaultDistrict && !this._anonymousCheckout && !this._authenticated;

    if (mcAnonymousConditions || tdAnonymousConditions) {
      this._deliveryZoneService.openDialog({ disableClose: false, startAnonymous: tdAnonymousConditions });
    } else {
      const currentChartItems = this._cartItemInfos.getValue();
      const beingUpdatedItem = currentChartItems.find((item) => item.item.productId === cartItem.productId);

      this.callUpdateCartService(
        [cartItem],
        [cartItem.productId],
        {
          beingUpdatedItem,
          cartItem,
          multiple: false,
          itemCount: 0,
          rawProduct,
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        referrerEventId ?? rawProduct?.referrerEventId,
        isCartPage,
        showSuccessMessage
      );
    }
  }

  updateAll(newCart: CartItemForm[], referrerId: string, isDelete = false, isCartPage = false): void {
    const productIds = newCart.reduce((acc, cartItem) => {
      return [...acc, cartItem.productId];
    }, []);

    const gtmProducts: GtmProductModel[] = newCart.reduce(this.reduceGTMProducts.bind(this), []);

    this.callUpdateCartService(
      newCart,
      productIds,
      {
        beingUpdatedItem: undefined,
        cartItem: gtmProducts,
        multiple: true,
        itemCount: newCart.length,
        rawProduct: undefined,
        isDelete: isDelete,
      },
      referrerId,
      isCartPage
    );
  }

  clear(): void {
    this._loadingIndicatorService.start();
    this._cartRestService
      .reset()
      .pipe(
        map((response) => response.data),
        finalize(() => this._loadingIndicatorService.stop()),
        catchError((error) => {
          this.errorHandler(error);
          return throwError(error);
        })
      )
      .subscribe((data) => {
        this.emitCartInfoToSubscribers(data);
      });
  }

  remindSuccess(): void {
    this._toasterService.showToaster({
      settings: {
        state: 'success',
      },
      data: {
        title: 'Takipte kalın!',
        message: 'Bu ürün stoklarımıza geldiğinde size e-mail yoluyla haber vereceğiz.',
      },
    });
  }

  maxAmountError(maxAmountInfo: MaxAmountInfoModel): void {
    const formattedAmount = this.formattedAmount(maxAmountInfo.amount, maxAmountInfo.unit);
    this._toasterService.showToaster({
      settings: {
        state: 'danger',
      },
      data: {
        title: 'Ürün eklenemedi!',
        message: `Bu üründen sepetinize maksimum ${formattedAmount} ekleyebilirsiniz`,
      },
    });
  }

  callCartActionTypes({
    beingUpdatedItem,
    cartItem,
    multiple,
    itemCount,
    rawProduct,
    isDelete = false,
    showSuccessMessage = true,
  }): void {
    let secondaryUnit;

    if (multiple) {
      isDelete ? this.onDeleteMultipleItems(itemCount, cartItem) : this.onAddMultipleItems(itemCount);
      return;
    }

    if (cartItem.unit !== rawProduct.primaryUnit) {
      secondaryUnit = cartItem.unit;
    }

    const changeAmount = Math.abs(cartItem.amount - (beingUpdatedItem?.item?.amount ?? 0));
    const gtmProduct: GtmProductModel = this._gtmService.generateGtmProductData(
      rawProduct,
      0,
      'productDetail',
      changeAmount,
      undefined,
      secondaryUnit
    );

    if (showSuccessMessage) {
      if (beingUpdatedItem === undefined) {
        this.onAddItem(gtmProduct);
        return;
      }

      if (beingUpdatedItem.item.amount > cartItem.amount) {
        if (cartItem.amount === 0) {
          this.onRemoveItem(gtmProduct);
        } else {
          this.onDecreaseItem(gtmProduct);
        }
      } else {
        this.onIncreaseItem(gtmProduct);
      }
    }
  }

  onAddItem(gtmProduct): void {
    this._gtmService.sendCartOperation('add', gtmProduct);
    this.showBasketActionsToastMessage({
      message: `${gtmProduct.name} sepete eklendi.`,
      title: 'Sepet güncellendi',
    });
  }

  onRemoveItem(gtmProduct): void {
    this._gtmService.sendCartOperation('remove', gtmProduct);
    this.showBasketActionsToastMessage({
      message: `${gtmProduct.name} sepetten çıkarıldı.`,
      title: 'Sepet güncellendi',
    });
  }

  onDecreaseItem(gtmProduct: GtmProductModel): void {
    const { quantity, unit, name } = gtmProduct;
    this._gtmService.sendCartOperation('remove', gtmProduct);
    this.showBasketActionsToastMessage({
      message: `${quantity} ${unit} ${name} sepetten çıkarıldı.`,
      title: 'Sepet güncellendi',
    });
  }

  onIncreaseItem(gtmProduct: GtmProductModel): void {
    const { quantity, unit, name } = gtmProduct;
    this._gtmService.sendCartOperation('add', gtmProduct);
    this.showBasketActionsToastMessage({
      message: `${quantity} ${unit} ${name} sepete eklendi.`,
      title: 'Sepet güncellendi',
    });
  }

  onAddMultipleItems(itemCount): void {
    this.showBasketActionsToastMessage({
      message: `${itemCount} adet ürün sepete eklendi.`,
      title: 'Sepet güncellendi',
    });
  }

  onDeleteMultipleItems(itemCount, gtmProducts): void {
    this._gtmService.sendCartOperation('remove', gtmProducts);

    this.showBasketActionsToastMessage({
      message: `${itemCount} adet ürün sepetinizden çıkarıldı.`,
      title: 'Sepet güncellendi',
    });
  }

  showBasketActionsToastMessage({ message, title }): void {
    this._toasterService.showToaster({
      data: {
        message,
        title,
      },
      settings: {
        state: 'success',
      },
    });
  }

  formattedAmount(amount: number, unit: ProductUnitModel): string {
    return this._formatAmount.transform(amount, unit) + ' ' + this._formatUnit.transform(unit);
  }

  private reduceGTMProducts(acc, cartItem, index): void {
    const gtmProduct = this._gtmService.generateGtmProductData(cartItem.product, index, 'cart', cartItem.amount);
    acc.push(gtmProduct);
    return acc;
  }

  private subscribeToUserAuthState(): void {
    this._userService.isAuthenticated$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((authenticated) => {
      this._authenticated = authenticated;
    });
    this._userService
      .isAnonymousCheckoutStart()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((anonymousCheckoutStart) => {
        this._anonymousCheckout = anonymousCheckoutStart;
      });
  }
}
