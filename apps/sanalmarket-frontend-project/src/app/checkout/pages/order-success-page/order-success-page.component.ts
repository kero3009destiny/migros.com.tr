import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AppStateService,
  GtmService,
  LoadingIndicatorService,
  LoggingService,
  SideNavService,
  UserService,
} from '@fe-commerce/core';
import { CheckoutAdditionalService, CheckoutService } from '@fe-commerce/line-checkout';
import { FormatPricePipe, SubscriptionAbstract } from '@fe-commerce/shared';

import { EMPTY, ReplaySubject } from 'rxjs';
import { catchError, filter, finalize, first, map, takeUntil } from 'rxjs/operators';

import { faMapMarkerAlt, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import { OrderInfoDTO, OrderRestControllerService, UserLocationInfoV2 } from '@migroscomtr/sanalmarket-angular';

import { ROUTE_HOME } from '../../../routes';
import {
  getEmbeddedDeliveryAddressName,
  getOrderSummaryTypeFromOrderInfo,
  OrderSummaryFields,
  OrderSummaryType,
} from '../../../shared';
import { CompleteMembershipEvent } from '../../components/order-success/complete-membership/complete-membership.ref';

@Component({
  selector: 'sm-order-success-page',
  templateUrl: './order-success-page.component.html',
  styleUrls: ['./order-success-page.component.scss'],
})
export class OrderSuccessPageComponent extends SubscriptionAbstract implements OnInit, OnDestroy {
  initialOrderInfo: OrderInfoDTO | undefined;
  updatedOrderInfo: OrderInfoDTO | undefined;
  faMapMarkerAlt: IconDefinition;
  orderInfoSubject = new ReplaySubject<OrderInfoDTO>();
  isPageDataFetched = false;

  constructor(
    public sideNavService: SideNavService,
    private _orderRestService: OrderRestControllerService,
    private _activatedRoute: ActivatedRoute,
    private _checkoutService: CheckoutService,
    private _additionalOrderService: CheckoutAdditionalService,
    private _gtmService: GtmService,
    private _router: Router,
    private _formatPrice: FormatPricePipe,
    private _loggingService: LoggingService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _userService: UserService,
    private _appState: AppStateService,
    private _ngZone: NgZone
  ) {
    super();
    this.faMapMarkerAlt = faMapMarkerAlt;
  }

  ngOnInit(): void {
    this.getOrderInfo(true);
    this.sendGtmPageViewEvent('OrderSuccess', this.getOrderId());
    this.createInitialOrderInfoSubscription();
    this.createUpdatedOrderInfoSubscription();
    this._appState.setFooterLite(true);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._userService.getUser();
    this._checkoutService.updateCheckoutStatus({ success: false });
    this._appState.setFooterLite(false);
  }

  createInitialOrderInfoSubscription(): void {
    this.orderInfoSubject.pipe(first(), takeUntil(this.getDestroyInterceptor())).subscribe((orderInfo) => {
      this.initialOrderInfo = orderInfo;
    });
  }

  createUpdatedOrderInfoSubscription(): void {
    this.orderInfoSubject.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((orderInfo) => {
      this.updatedOrderInfo = orderInfo;
    });
  }

  getOrderInfo(sendGtmEvent: boolean): void {
    this._loadingIndicatorService.start();
    this._orderRestService
      .get4(this.getOrderId())
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => {
          this._checkoutService.updateCheckoutStatus({ success: false });
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        map((response) => {
          if (!response.successful) {
            this._loggingService.logError({ title: response.errorTitle, message: response.errorDetail });
            setTimeout(() => {
              // TODO remove timeout when redirected page in pwa
              this._router.navigateByUrl('/');
            }, 500);
            return EMPTY;
          }
          return response.data;
        }),
        filter((orderInfo) => !!orderInfo),
        finalize(() => {
          this._loadingIndicatorService.stop();
          this.isPageDataFetched = true;
        })
      )
      .subscribe((orderInfo: OrderInfoDTO) => {
        if (sendGtmEvent) {
          this.sendGtmEvent(orderInfo);
        }
        this.checkDeliveryAddressDetails();
        this._checkoutService.updateCheckoutStatus({ success: true });
        this.orderInfoSubject.next(orderInfo);
      });
  }

  checkDeliveryAddressDetails(): void {
    if (this.getOrderSummaryType() === OrderSummaryType.PICK_POINT && !this.getDeliveryAddressDetails()) {
      throw new Error(
        `No deliveryAddressDetails found for PICK_POINT order type at OrderSuccessPage with order: ${this.initialOrderInfo}`
      );
    }
  }

  onClickReturnHomePage(): void {
    this._router.navigate([ROUTE_HOME]);
  }

  sendGtmEvent(orderInfo: OrderInfoDTO): void {
    const {
      line: order,
      itemInfos,
      totalPrice,
      deliveryPrice,
      couponCode,
      totalDiscount,
      productPrice,
      revenue,
      payments,
    } = orderInfo;

    const products = itemInfos?.map((checkoutItem, index) => {
      return this._gtmService.generateGtmProductData(
        // TODO Fix alternative unit type clash
        // @ts-ignore
        checkoutItem.product,
        index,
        'checkout/success',
        checkoutItem.item.amount,
        checkoutItem.totalDiscount
      );
    });

    const data = {
      event: 'ecommercePurchase',
      nonInteraction: true,
      eventType: 'Purchase',
      ecommerce: {
        purchase: {
          actionField: {
            id: order.id, // Transaction ID. Required for purchases and refunds.
            orderDiscount: this._formatPrice.transform(totalDiscount, '.'),
            orderShipping: this._formatPrice.transform(deliveryPrice, '.'),
            orderTotal: this._formatPrice.transform(totalPrice, '.'), // Total transaction value(incl. tax & shipping)
            orderSubTotal: this._formatPrice.transform(productPrice, '.'),
            revenue: this._formatPrice.transform(revenue, '.'),
            voucherCode: payments.find((payment) => payment.type === 'VOUCHER')?.paymentCode,
            coupon: couponCode,
          },
          products,
        },
      },
    };

    this._gtmService.sendCheckoutEvent(data);
  }

  sendGtmPageViewEvent(page, id): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Sipariş Başarılı | Migros',
      virtualPageName: page,
      objectId: id,
    });
  }

  getOrderId(): number {
    return +this._activatedRoute.snapshot.params['id'];
  }

  get orderSummaryFields(): OrderSummaryFields {
    return {
      orderType: this.getOrderSummaryType(),
      isAnonymousOrderTrackInfoShown: this.isAnonymousOrderTrackInfoShown(),
      itemCount: this.initialOrderInfo?.line?.itemCount,
      deliveryAddressName: this.getDeliveryAddressNameByOrderSummaryType(),
      deliveryDate: this.initialOrderInfo?.line?.deliveryDate,
      timeSlotDetails: this.initialOrderInfo?.line?.timeSlotDetails,
      orderAmount: this.initialOrderInfo?.productPrice,
      deliveryFee: this.initialOrderInfo?.shownDeliveryFee,
      overallTotal: this.initialOrderInfo?.revenue,
      migrosDiscount: this.initialOrderInfo?.shownProductDiscount,
      cartDiscount: this.initialOrderInfo?.shownLineDiscount,
      specialDiscount: this.initialOrderInfo?.lineSpecialDiscount,
      couponDiscount: this.initialOrderInfo?.lineCouponDiscount,
      instantDiscount: this.initialOrderInfo?.lineInstantDiscount,
      payments: this.initialOrderInfo?.payments,
      etaInfo: this.initialOrderInfo?.line.etaInfo,
    };
  }

  getDeliveryAddressNameByOrderSummaryType(): string {
    return this.getOrderSummaryType() === OrderSummaryType.FOUNDATION
      ? this.getEmbeddedDeliveryAddressName()
      : undefined;
  }

  getEmbeddedDeliveryAddressName(): string | undefined {
    return this.initialOrderInfo && getEmbeddedDeliveryAddressName(this.initialOrderInfo);
  }

  getDeliveryAddressDetails(): string | undefined {
    return this.initialOrderInfo && this.initialOrderInfo.line.deliveryAddressDetails;
  }

  getOrderSummaryType(): OrderSummaryType | undefined {
    return this.initialOrderInfo && getOrderSummaryTypeFromOrderInfo(this.initialOrderInfo);
  }

  isInitialOrderAnonymous(): boolean {
    return !!this.initialOrderInfo?.line?.anonymous;
  }

  isUpdatedOrderAnonymous(): boolean {
    return !!this.updatedOrderInfo?.line?.anonymous;
  }

  isPickPointLocationCardShown(): boolean {
    return this.getOrderSummaryType() === 'PICK_POINT';
  }

  isMembershipCompleted(): boolean {
    return this.isInitialOrderAnonymous() && !this.isUpdatedOrderAnonymous();
  }

  onCompleteMembership(event: CompleteMembershipEvent): void {
    this._loadingIndicatorService.start();
    this._userService
      .identifyAnonymousUser({ orderId: this.getOrderId(), permitContact: event.permitContact ?? false })
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((data: UserLocationInfoV2) => {
        this._ngZone.run(() => this.getOrderInfo(false));
      });
  }

  isUserOrdersLinkShownInSuccessApproval(): boolean {
    return !this.isInitialOrderAnonymous();
  }

  isCompleteMembershipCardShown(): boolean {
    return this.isInitialOrderAnonymous();
  }

  isAnonymousOrderTrackInfoShown(): boolean {
    return this.isUpdatedOrderAnonymous();
  }

  isAdditionalOrderButtonShown(): boolean {
    return !!this.updatedOrderInfo?.extra?.addable;
  }

  onClickAdditionalOrder(): void {
    this._additionalOrderService.start(this.getOrderId()).subscribe(() => {
      this._router.navigate(['/']);
    });
  }
}
