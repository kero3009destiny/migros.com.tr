import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AppStateService, LoadingIndicatorService, LoggingService, ShortfallDialogService } from '@fe-commerce/core';
import { SidePaymentFacade } from '@fe-commerce/line-payment-side';
import {
  CheckoutStateModel,
  CouponApplyModel,
  ErrorCodes,
  HttpResponseModel,
  ShortfallDialogModel,
} from '@fe-commerce/shared';

import { catchError, distinctUntilChanged, filter, finalize, map, startWith, switchMap, tap } from 'rxjs/operators';

import { combineLatest, EMPTY, Observable, ReplaySubject, throwError } from 'rxjs';
import {
  AddressInfoBean,
  CartFormBean,
  CheckoutAddressFormBean,
  CheckoutInfoDTO,
  CheckoutRestControllerService,
  CheckoutScheduleFormBean,
  ScheduleInfoDto,
  ServiceResponseScheduleInfoDto,
} from '@migroscomtr/sanalmarket-angular';

import { BagType, CheckoutSteps } from '../../models';
import { CheckoutAdditionalService } from '../checkout-additional/checkout-additional.service';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private _checkout = new ReplaySubject<CheckoutInfoDTO>(1);
  private _checkoutStatus = new ReplaySubject<CheckoutStateModel>(1);
  private _scheduleInfo = new ReplaySubject<ScheduleInfoDto>(1);
  private _appliedCoupon = new ReplaySubject<CouponApplyModel>(1);

  private selectedDeliveryAddress: AddressInfoBean;
  private selectedInvoiceAddress: AddressInfoBean;

  constructor(
    private _checkoutRestService: CheckoutRestControllerService,
    private _router: Router,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _additionalService: CheckoutAdditionalService,
    private _loggingService: LoggingService,
    private _shortfallDialogService: ShortfallDialogService,
    private _sidePaymentService: SidePaymentFacade,
    private _appStateService: AppStateService
  ) {
    this._subscribeToCheckoutStatus();
    this._subscribeToAppliedCoupon();
  }

  get checkout$() {
    return this._checkout.asObservable();
  }

  get checkoutStatus$() {
    return this._checkoutStatus.asObservable();
  }

  get isAdditionalActive$() {
    return this._additionalService.isActive$;
  }

  getScheduleInfo(): Observable<ScheduleInfoDto> {
    return this._scheduleInfo.asObservable();
  }

  getSelectedDeliveryAddress(): AddressInfoBean {
    return this.selectedDeliveryAddress;
  }

  getSelectedInvoiceAddress(): AddressInfoBean {
    return this.selectedInvoiceAddress;
  }

  setSelectedDeliveryAddress(selectedDeliveryAddress: AddressInfoBean): void {
    this.selectedDeliveryAddress = selectedDeliveryAddress;
  }

  setSelectedInvoiceAddress(selectedInvoiceAddress: AddressInfoBean): void {
    this.selectedInvoiceAddress = selectedInvoiceAddress;
  }

  updateCheckoutStatus(status: CheckoutStateModel): void {
    this._checkoutStatus.next(status);
  }

  getCheckoutInfo(checkoutId: number, checkoutStep: CheckoutSteps): void {
    if (checkoutStep === CheckoutSteps.SCHEDULE && this._appStateService.isUserNavigatedViaBackButton()) {
      return;
    }

    this._loadingIndicatorService.start();
    this._checkoutRestService
      .getV2(checkoutId, checkoutStep)
      .pipe(
        catchError((error) => {
          this._router.navigate(['', 'sepetim']);
          return throwError(error);
        }),
        map((response: HttpResponseModel<CheckoutInfoDTO>) => response.data),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((checkoutInfo) => {
        this._checkout.next(checkoutInfo);
      });
  }

  getCalculatedCheckoutRevenueToBePaid(): Observable<number> {
    return combineLatest([this.checkout$, this._sidePaymentService.getUsedSidePayment$().pipe(startWith(null))]).pipe(
      map(([checkoutInfo, sidePayment]) => {
        let calculatedRevenue = checkoutInfo.revenue;
        if (
          checkoutInfo.line?.bagSelected !== null &&
          checkoutInfo.line?.bagSelected !== undefined &&
          Object.keys(checkoutInfo.bagInfo).length !== 0 &&
          !this._appStateService.isUserNavigatedViaBackButton()
        ) {
          calculatedRevenue = checkoutInfo.line.bagSelected
            ? checkoutInfo.bagInfo[BagType.PLASTIC_BAG].orderedAmountWithBag
            : checkoutInfo.bagInfo[BagType.CLOTH_BAG].orderedAmountWithBag;
        }
        if (sidePayment?.discount) {
          calculatedRevenue = calculatedRevenue - sidePayment.discount;
        }
        return calculatedRevenue;
      })
    );
  }

  getCalculatedTotalReduction(): Observable<number> {
    return combineLatest([this.checkout$, this._sidePaymentService.getUsedSidePayment$().pipe(startWith(null))]).pipe(
      map(([checkoutInfo, sidePayment]) => {
        let calculatedReduction = checkoutInfo.totalReduction;
        if (sidePayment?.discount) {
          calculatedReduction = calculatedReduction + sidePayment.discount;
        }
        return calculatedReduction;
      })
    );
  }

  updateCheckout(checkoutData: CheckoutInfoDTO): void {
    this._checkout.next(checkoutData);
  }

  addressCheckout(checkoutId: number, formBean: CheckoutAddressFormBean): Observable<CheckoutInfoDTO> {
    this._loadingIndicatorService.start();
    //
    return this._checkoutRestService.addressCheckout(checkoutId, formBean).pipe(
      catchError((err) => throwError(err)),
      map((response) => response.data),
      filter((data) => !!data),
      tap((data) => {
        this.updateCheckout(data);
      }),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  applyCoupon(discount: CouponApplyModel): void {
    this._appliedCoupon.next(discount);
  }

  fetchScheduleInfo(checkoutId: number): void {
    this._loadingIndicatorService.start();
    this._checkoutRestService
      .getScheduleInfo(checkoutId)
      .pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        filter((response: ServiceResponseScheduleInfoDto) => response.successful),
        map((response: ServiceResponseScheduleInfoDto) => response.data),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((scheduleInfo: ScheduleInfoDto) => {
        this._scheduleInfo.next(scheduleInfo);
      });
  }

  schedule(checkoutId: number, checkoutScheduleForm: CheckoutScheduleFormBean): Observable<CheckoutInfoDTO> {
    this._loadingIndicatorService.start();
    return this._checkoutRestService.scheduleCheckout(checkoutId, checkoutScheduleForm).pipe(
      catchError((error) => {
        this.createCheckoutErrorHandler(error.error);
        return throwError(error);
      }),
      map((response) => response.data),
      tap((data) => {
        this.updateCheckout(data);
      }),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  newCheckout(cartFormBean: CartFormBean): Observable<CheckoutInfoDTO> {
    this._loadingIndicatorService.start();

    return this._checkoutRestService.newCheckout(cartFormBean).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  newDerivedCheckout(): Observable<CheckoutInfoDTO> {
    this._loadingIndicatorService.start();

    return this._checkoutRestService.newDerivedCheckoutV2().pipe(
      catchError((error) => {
        return throwError(error);
      }),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  createCheckoutErrorHandler(error: HttpResponseModel): void {
    this._loadingIndicatorService.stop();

    if (error?.errorCode === ErrorCodes.SHORTFALL) {
      const productList = error.data.shortfallItems;
      const priceLeftForCheckout = error.data.priceLeftForCheckout;
      this._shortfallDialogService.openShortfallDialog({
        shortfallData: { productList, priceLeftForCheckout },
        onClose: (data) => this.onShortfallDialogClose(data),
      });
    }
  }

  onShortfallDialogClose(data: ShortfallDialogModel): void {
    this._additionalService.isActive$.subscribe((isAdditionalActive) => {
      if (data?.priceLeftForCheckout > 0 || !isAdditionalActive) {
        this._router.navigate(['/sepetim']);
      }
    });
  }

  private _subscribeToAppliedCoupon() {
    this._appliedCoupon
      .pipe(
        switchMap((coupon) =>
          this.checkout$.pipe(
            map((currentCheckout) => {
              const discountChange = coupon.lineCouponDiscount - currentCheckout.lineCouponDiscount;
              return {
                ...currentCheckout,
                ...coupon,
                totalReduction: currentCheckout.totalReduction + discountChange,
                revenue: currentCheckout.revenue - discountChange,
              };
            })
          )
        )
      )
      .subscribe((updatedCheckout) => {
        this._checkout.next(updatedCheckout);
      });
  }

  private _subscribeToCheckoutStatus() {
    combineLatest([this.checkout$, this.checkoutStatus$])
      .pipe(
        distinctUntilChanged(),
        filter(([checkout, status]) => checkout.line && status.success)
      )
      .subscribe(([checkout]) => {
        if (checkout?.line?.derivedOrderId) {
          this._additionalService.statusChanged({ isActive: false });
        }
        this._router.navigate([`/siparis/basarili/${checkout.line.id}`]);
      });
  }
}
