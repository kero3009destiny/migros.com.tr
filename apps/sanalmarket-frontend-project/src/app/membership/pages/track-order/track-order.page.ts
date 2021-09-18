import { ChangeDetectorRef, Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material-experimental/mdc-dialog';

import { SubscriptionAbstract, ToasterService } from '@fe-commerce/shared';
import { LoadingIndicatorService, UserService } from '@fe-commerce/core';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { OrderService } from '@fe-commerce/membership';
import { PhoneVerifyService } from '@fe-commerce/auth';

import { finalize, switchMap, takeUntil } from 'rxjs/operators';

import {
  OrderAnonymousRestControllerService,
  OrderInfoDTO,
  OtpRegistrationControllerV2Service,
  SimpleOrderInfoDTO,
  UserDTO,
  UserLocationInfoV2,
} from '@migroscomtr/sanalmarket-angular';
import { ReplaySubject } from 'rxjs';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-light-svg-icons/faTimes';

import { OrderSummaryType } from '../../../shared/models';
import { getOrderSummaryTypeFromOrderInfo } from '../../../shared/utils';
import { OrderFeedbackFormDialogComponent } from '../../components';
import { OrderRateDialog } from '../../components/order-rate/order-rate-dialog.component';
import { OtpLoginDialogComponent } from '../../../core/dialogs';

@Component({
  selector: 'sm-track-order',
  templateUrl: './track-order.page.html',
  styleUrls: ['./track-order.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TrackOrderPage extends SubscriptionAbstract implements OnInit {
  initialOrderInfo: OrderInfoDTO | undefined;
  updatedOrderInfo: OrderInfoDTO | undefined;
  isPageDataFetched = false;
  orderInfoSubject = new ReplaySubject<OrderInfoDTO>();
  permitContact;
  selectedFilterOption;
  filterOptions = [
    { name: 'Son 1 Ay', value: 1 },
    { name: 'Son 3 Ay', value: 3 },
    { name: 'Son 6 Ay', value: 6 },
    { name: 'Son 1 Yıl', value: 12 },
  ];
  protected _dialogRef: MatDialogRef<OtpLoginDialogComponent>;
  private _user: UserDTO;
  private _isDetailActive = false;
  private orderInfo: SimpleOrderInfoDTO;

  constructor(
    private _loadingIndicatorService: LoadingIndicatorService,
    private _userService: UserService,
    private _ngZone: NgZone,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _checkoutService: CheckoutService,
    private _orderService: OrderService,
    private _cdr: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private _orderAnonymousRestControllerService: OrderAnonymousRestControllerService,
    private _toasterService: ToasterService,
    private _phoneVerifyService: PhoneVerifyService,
    private _registrationService: OtpRegistrationControllerV2Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.getSelectedFilterOption();
    this.getOrder();
  }

  getOrderId(): number {
    return +this._activatedRoute.snapshot.queryParams['id'];
  }

  getSelectedFilterOption(): void {
    this.selectedFilterOption = this.filterOptions[0].value;
  }

  getOrderSummaryType(): OrderSummaryType | undefined {
    return this.initialOrderInfo && getOrderSummaryTypeFromOrderInfo(this.initialOrderInfo);
  }

  getDeliveryAddressDetails(): string | undefined {
    return this.initialOrderInfo && this.initialOrderInfo.line.deliveryAddressDetails;
  }

  getOrder(): void {
    this._loadingIndicatorService.start();
    this._orderService
      .getAnonymousOrder(
        parseInt(this._activatedRoute.snapshot?.queryParams['id']),
        this._activatedRoute.snapshot?.queryParams['p']
      )
      .subscribe((data) => {
        this.orderInfo = data.data;
        this.isPageDataFetched = true;
        this._loadingIndicatorService.stop();
      });
  }

  checkDeliveryAddressDetails(): void {
    if (this.getOrderSummaryType() === OrderSummaryType.PICK_POINT && !this.getDeliveryAddressDetails()) {
      throw new Error(
        `No deliveryAddressDetails found for PICK_POINT order type at OrderSuccessPage with order: ${this.initialOrderInfo}`
      );
    }
  }

  getOrderInfo(sendGtmEvent: boolean): void {
    this._loadingIndicatorService.start();
    this._orderService.getAnonymousOrderInfo(this.getOrderId()).subscribe((orderInfo: OrderInfoDTO) => {
      this._loadingIndicatorService.stop();
      this.checkDeliveryAddressDetails();
      this._checkoutService.updateCheckoutStatus({ success: true });
      this.orderInfoSubject.next(orderInfo);
    });
  }

  onCompleteMembership(): void {
    this._userService
      .identifyAnonymousUser({ orderId: this.getOrderId(), permitContact: this.permitContact ?? false })
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

  onUserVerified(): void {
    this.onCompleteMembership();
  }

  isInitialOrderAnonymous(): boolean {
    return !!this.initialOrderInfo?.line?.anonymous;
  }

  isUpdatedOrderAnonymous(): boolean {
    return !!this.updatedOrderInfo?.line?.anonymous;
  }

  getIsPageDataFetched(): boolean {
    return this.isPageDataFetched;
  }

  onCloseDetail(): void {
    this._isDetailActive = false;
    this._cdr.detectChanges();
  }

  onDownloadInvoice(orderId: number): void {
    this._orderService.downloadInvoice(orderId);
  }

  onOpenDeliveryForm(orderId: number): void {
    this._orderService.getDeliveryForm(orderId);
  }

  onCancelOrder(order: SimpleOrderInfoDTO, removeDialogTemplateRef): void {
    this._matDialog
      .open(removeDialogTemplateRef, {
        panelClass: ['order-remove-dialog'],
      })
      .afterClosed()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        switchMap((isCancelApproved) => {
          if (isCancelApproved) {
            return this._orderAnonymousRestControllerService
              .cancel({
                id: this.orderInfo.line.id,
                phoneNumber: this.orderInfo.line.phoneNumber,
              })
              .pipe(
                takeUntil(this.getDestroyInterceptor()),
                finalize(() => {
                  this._loadingIndicatorService.stop();
                })
              );
          }
        })
      )
      .subscribe((data: any) => {
        this.showSuccessToaster(this.orderInfo.line.id);
        this._router.navigate(['/']);
      });
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
  onOpenOrderFeedback(): void {
    this._matDialog
      .open(OrderFeedbackFormDialogComponent, {
        panelClass: ['wide-dialog', 'mobile-modal', 'sm-order-feedback-form'],
        data: {
          user: this._user ? this._user : '',
        },
      })
      .afterClosed();
  }

  onOpenOrderRateDialog(order: SimpleOrderInfoDTO): void {
    const dialogRef = this._matDialog.open(OrderRateDialog, {
      panelClass: ['wide-dialog', 'mobile-modal', 'order-rate-dialog'],
      data: order.simpleOrderFeedback,
    });
  }

  getTimesIcon(): IconProp {
    return faTimes;
  }

  getSelectedOrder(): SimpleOrderInfoDTO {
    return this.orderInfo;
  }

  onClickRegister(): void {
    this._router.navigateByUrl('kayit');
  }
}
