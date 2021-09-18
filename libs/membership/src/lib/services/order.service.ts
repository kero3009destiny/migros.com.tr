import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { GtmService, LoadingIndicatorService, LoggingService, UserService } from '@fe-commerce/core';
import { SubscriptionAbstract, ToasterService } from '@fe-commerce/shared';

import { catchError, filter, finalize, map, takeUntil, tap } from 'rxjs/operators';

import { EMPTY, Observable, Subject, Subscription, throwError } from 'rxjs';
import {
  OrderAnonymousRestControllerService,
  OrderInfoDTO,
  OrderRestControllerService,
  ScheduleInfoDto,
  ServiceResponseOrderInfoDTO,
  ServiceResponseScheduleInfoDto,
  SimpleOrderInfoDTO,
  TimeslotChangeRequest,
} from '@migroscomtr/sanalmarket-angular';
import { CheckoutService } from '@fe-commerce/line-checkout';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends SubscriptionAbstract {
  private _orders = new Subject<SimpleOrderInfoDTO[]>();
  private orderInfo: SimpleOrderInfoDTO;
  private isPageDataFetched = false;

  constructor(
    private _orderRestControllerService: OrderRestControllerService,
    private _orderAnonymousRestControllerService: OrderAnonymousRestControllerService,
    private _router: Router,
    private _gtmService: GtmService,
    private _toasterService: ToasterService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _userService: UserService,
    private _activatedRoute: ActivatedRoute,
    private _loggingService: LoggingService,
    private _checkoutService: CheckoutService
  ) {
    super();
  }

  getOrders(): Observable<SimpleOrderInfoDTO[]> {
    return this._orders.asObservable();
  }

  fetchUserOrders(month): void {
    this._orderRestControllerService
      .getUserOrderInfos(month, 0, 1000)
      .pipe(
        map((response) => response.data),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((orders) => {
        this._orders.next(orders);
      });
  }

  downloadInvoice(orderId: number): Subscription {
    this._loadingIndicatorService.start();
    return this._orderRestControllerService
      .getInvoice(orderId)
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => throwError(error)),
        map((response) => response.data),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe(({ invoiceUUID, fileBytesBase64 }) => this.openPdf(invoiceUUID, fileBytesBase64));
  }

  getDeliveryForm(orderId: number): void {
    this._loadingIndicatorService.start();

    this._orderRestControllerService
      .getDeliveryForm(orderId)
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.data),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((data) => {
        const file = new Blob([data], { type: 'text/html' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      });
  }

  cancelOrder(orderId: number, selectedMonthFilter: number): void {
    this._loadingIndicatorService.start();
    this._orderRestControllerService
      .cancel1(orderId)
      .pipe(
        catchError((error) => throwError(error)),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe(() => {
        this.showSuccessToaster(orderId);
        this.sendGtmEvent(orderId);
        this._userService.getUser();
        this.fetchUserOrders(selectedMonthFilter);
      });
  }

  getAnonymousOrder(id: number, phoneNumber: string): Observable<ServiceResponseOrderInfoDTO> {
    return this._orderAnonymousRestControllerService.getAnonymous({ id, phoneNumber }).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error.error.errorDetail });
        return EMPTY;
      }),
      takeUntil(this.getDestroyInterceptor())
    );
  }

  getAnonymousOrderInfo(orderId): Observable<Observable<never> | OrderInfoDTO> {
    return this._orderRestControllerService.get4(orderId).pipe(
      takeUntil(this.getDestroyInterceptor()),
      catchError((error) => {
        this._checkoutService.updateCheckoutStatus({ success: false });
        this._loggingService.logError({ title: 'Hata', message: error.error.errorDetail });
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
    );
  }

  showSuccessToaster(orderId): void {
    this._toasterService.showToaster({
      settings: {
        state: 'success',
      },
      data: {
        title: 'İşlem başarılı!',
        message: `${orderId} numaralı sipariş iptal edildi`,
      },
    });
  }

  sendGtmEvent(orderId): void {
    this._gtmService.sendCheckoutEvent({
      event: 'ecommerceRefund',
      nonInteraction: true,
      eventType: 'Refund',
      ecommerce: {
        refund: {
          actionField: { id: orderId },
        },
      },
    });
  }

  changeInvoiceAddress(orderId: number, addressId: number): Observable<OrderInfoDTO> {
    return this._orderRestControllerService.changeInvoiceAddress(orderId, addressId).pipe(
      tap(() => this._loadingIndicatorService.start()),
      catchError((error) => throwError(error)),
      map((response: ServiceResponseOrderInfoDTO) => response.data),
      filter((data) => !!data),
      finalize(() => this._loadingIndicatorService.stop())
    );
  }

  reschedule(orderId: number, timeslotChangeRequest: TimeslotChangeRequest): Observable<OrderInfoDTO> {
    return this._orderRestControllerService.reschedule(orderId, timeslotChangeRequest).pipe(
      tap(() => this._loadingIndicatorService.start()),
      catchError((error) => throwError(error)),
      map((response: ServiceResponseOrderInfoDTO) => response.data),
      filter((data) => !!data),
      finalize(() => this._loadingIndicatorService.stop())
    );
  }

  getOrderScheduleInfo(orderId): Observable<ScheduleInfoDto> {
    return this._orderRestControllerService.getScheduleInfo1(orderId).pipe(
      tap(() => this._loadingIndicatorService.start()),
      catchError((error) => throwError(error)),
      map((response: ServiceResponseScheduleInfoDto) => response.data),
      filter((data) => !!data),
      finalize(() => this._loadingIndicatorService.stop())
    );
  }

  private openPdf(fileName, fileBytesBase64): void {
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = 'data:application/pdf;base64,' + fileBytesBase64;
    a.download = fileName;
    a.click();
    setTimeout(() => {
      a.remove();
    }, 200);
  }
}
