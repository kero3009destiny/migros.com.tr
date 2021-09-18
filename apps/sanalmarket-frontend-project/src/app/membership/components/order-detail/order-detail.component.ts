import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { CheckoutAdditionalService } from '@fe-commerce/line-checkout';
import { SubscriptionAbstract } from '@fe-commerce/shared';
import { CartService } from '@fe-commerce/line-cart';
import { AppStateService, PortfolioEnum } from '@fe-commerce/core';

import { filter, takeUntil } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCartPlus,
  faChevronRight,
  faFileCheck,
  faFileInvoice,
  faStar,
  faTimesCircle,
} from '@fortawesome/pro-regular-svg-icons';
import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons/faArrowLeft';
import { faQuestionCircle } from '@fortawesome/pro-solid-svg-icons';
import {
  OrderDTO,
  OrderInfoDTO,
  OrderItemInfoDTO,
  OrderPaymentDTO,
  SimpleOrderInfoDTO,
} from '@migroscomtr/sanalmarket-angular';

import { ROUTE_HOME } from '../../../routes';
import { OrderAddressDialogComponent } from '../order-address-dialog/order-address-dialog.component';
import { OrderRescheduleDialogComponent } from '../order-reschedule-dialog/order-reschedule-dialog.component';

import CollectionStatusEnum = OrderDTO.CollectionStatusEnum;
import DeliveryModelEnum = OrderDTO.DeliveryModelEnum;
import ScheduleTypeEnum = OrderDTO.ScheduleTypeEnum;

const orderPaymentTypes = {
  CASH_ON_DELIVERY: ' Kapıda Nakit Ödeme',
  CREDIT_CARD_ON_DELIVERY: 'Kapıda Kredi Kartı ile Ödeme',
  CREDIT_CARD: 'Kredi Kartı ile Online Ödeme',
  MASTERPASS: 'Masterpass ile Ödeme',
  GARANTI_PAY: 'GarantiPay ile Ödeme',
  BKM: 'BKM Express ile Ödeme',
  VALUE_DATE: 'Valörlü Ödeme',
  WALLET: 'Cüzdan ile Ödeme',
  LOAN: 'Hazır Limit ile Ödeme',
  MONEY_POINT: 'Money Puan ile Ödeme',
  PERSONNEL_BOND: 'Personel Bonosu ile Ödeme',
  CUSTOMER_BOND: 'Müşteri Bonosu ile Ödeme',
  VOUCHER: 'Sanal Çek ile Ödeme',
  CARD_REWARD: 'Banka Puanı ile Ödeme',
};
@Component({
  selector: 'sm-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class OrderDetailComponent extends SubscriptionAbstract implements OnInit {
  @Input() order: SimpleOrderInfoDTO;
  @Output() closeDetailModeEvent = new EventEmitter<void>();
  @Output() downloadInvoice = new EventEmitter<number>();
  @Output() openDeliveryForm = new EventEmitter<number>();
  @Output() cancelOrder = new EventEmitter<SimpleOrderInfoDTO>();
  @Output() openOrderFeedback = new EventEmitter<void>();
  @Output() openOrderRate = new EventEmitter<SimpleOrderInfoDTO>();

  private _backIcon = faArrowLeft;
  private _starIcon = faStar;
  private _questionIcon = faQuestionCircle;
  private _invoiceIcon = faFileInvoice;
  private _deliveryFormIcon = faFileCheck;
  private _cartPlusIcon = faCartPlus;
  private _timesCircleIcon = faTimesCircle;

  constructor(
    private _cartService: CartService,
    private _matDialog: MatDialog,
    private _additionalOrderService: CheckoutAdditionalService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _appStateService: AppStateService
  ) {
    super();
  }

  ngOnInit(): void {
    // check if the products are already in the cart and update their amounts
    this._cartService.cartItems$.subscribe((cartItemInfos) => {
      this.order.itemInfos.forEach((itemInfo) => {
        for (const cartItemInfo of cartItemInfos) {
          if (itemInfo.item.productId === cartItemInfo.item.productId) {
            itemInfo.item.amount = cartItemInfo.item.amount;
            return;
          }
        }
        itemInfo.item.amount = 0;
      });
      this._cdr.detectChanges();
    });
  }

  getReturnIcon(): IconProp {
    return this._backIcon;
  }
  getStarIcon(): IconProp {
    return this._starIcon;
  }

  getQuestionIcon(): IconProp {
    return this._questionIcon;
  }

  getInvoiceIcon(): IconProp {
    return this._invoiceIcon;
  }
  getDeliveryFromIcon(): IconProp {
    return this._deliveryFormIcon;
  }

  getCartPlusIcon(): IconProp {
    return this._cartPlusIcon;
  }

  getTimesCircleIcon(): IconProp {
    return this._timesCircleIcon;
  }

  getStatus(): CollectionStatusEnum {
    return this.order.line.cancelled
      ? CollectionStatusEnum.Cancelled
      : !this.order.line.deliveryStatus
      ? CollectionStatusEnum.NewPending
      : this.order.line.collectionStatus;
  }

  getDeliveryTime(): string {
    const date = new Date(this.order.line.deliveryDate).toLocaleDateString('tr-TR');
    const { timeSlotDetails } = this.order.line;
    return this.isTimeSlot() ? date + ' , ' + timeSlotDetails : date;
  }

  getDelivererRatingValue(): number {
    return this.order.simpleOrderFeedback.delivererRate ?? 0;
  }

  getOrderRatingValue(): number {
    return this.order.simpleOrderFeedback.orderRate ?? 0;
  }

  getCreationDate(): string {
    return new Date(this.order.line.creationDate).toLocaleDateString('tr-TR');
  }

  getInstantDeliveryTime(): number {
    return this.order.line.etaInfo.eta;
  }

  getItemInfos(): OrderItemInfoDTO[] {
    return this.order.itemInfos;
  }

  getPaymentTypes(): OrderPaymentDTO[] {
    return this.order.payments;
  }

  getItemCount(): number {
    return this.order.itemInfos.length;
  }

  getUnitLabel(unit: string): string {
    return unit === 'PIECE' || unit === 'PACKET' ? 'adet' : 'kg';
  }

  getTrackId(): string {
    return JSON.parse(this.order.line.embeddedShipmentProviderInfo).trackingId;
  }

  getTrackingUrl(): string {
    return JSON.parse(this.order.line.embeddedShipmentProviderInfo).trackingUrl;
  }

  getChevronRightIcon(): IconProp {
    return faChevronRight;
  }

  getPaymentLabel(payment: OrderPaymentDTO): string {
    return orderPaymentTypes[payment.type];
  }

  isActive(): boolean {
    return !this.order.line.completed;
  }

  isOrderEmpty(): boolean {
    return !this.order;
  }

  isOrderRateButtonVisible(): boolean {
    return this.order.line.simpleOrderFeedback.showRate;
  }

  isOrderRated(): boolean {
    return !!this.order.line.simpleOrderFeedback.orderRate;
  }

  isInstantDelivery(): boolean {
    return this.order.line.scheduleType === ScheduleTypeEnum.Instant;
  }

  isTimeSlot(): boolean {
    return this.order.line.scheduleType === ScheduleTypeEnum.TimeSlot;
  }

  isTrackIdExist(): boolean {
    return !!this.order.line.embeddedShipmentProviderInfo;
  }

  isShipment(): boolean {
    return this.order.line.deliveryModel === DeliveryModelEnum.Shipment;
  }

  isCancelled(): boolean {
    return this.order.line.cancelled;
  }

  isFoundation(): boolean {
    return this.order.line.deliveryAddressObjectType === 'FOUNDATION';
  }

  isOrderAddable(): boolean {
    return this.order.extra.addable;
  }

  isAdditionalOrder(): boolean {
    return this.order.line.type === 'ADDITIONAL';
  }

  isHemenPortfolio(): boolean {
    return this._appStateService.getPortfolio() === PortfolioEnum.HEMEN;
  }

  showRateResults(): boolean {
    return !this.isOrderRateButtonVisible() && !this.isOrderAddable();
  }

  onClickDownloadInvoice(): void {
    this.downloadInvoice.emit(this.order.line.id);
  }

  onClickDeliveryForm(): void {
    this.openDeliveryForm.emit(this.order.line.id);
  }

  onReturnButtonClicked(): void {
    this.closeDetailModeEvent.emit();
  }

  openAddressModal(isAddressChangeDialog: boolean): void {
    const dialogRef = this._matDialog.open(OrderAddressDialogComponent, {
      panelClass: ['wide-dialog', 'mobile-modal'],
      data: {
        isAddressChangeDialog,
        orderId: this.order.line.id,
      },
    });

    dialogRef.componentInstance.addressChanged
      .pipe(
        filter((orderInfo) => !!orderInfo),
        takeUntil(this.getDestroyInterceptor())
      )
      .subscribe((orderInfo: OrderInfoDTO) => {
        this.order.line = orderInfo.line;
        this._cdr.detectChanges();
      });
  }

  onCancelOrder(): void {
    this.cancelOrder.emit(this.order);
  }

  onClickOrderHelp(): void {
    this.openOrderFeedback.emit();
  }

  onOpenOrderRateDialog(): void {
    this.openOrderRate.emit(this.order);
  }

  openDeliveryTimeModal(): void {
    const { id, timeSlotId, deliveryDate } = this.order.line;
    const dialogRef = this._matDialog.open(OrderRescheduleDialogComponent, {
      data: {
        orderId: id,
        orderTimeSlotId: timeSlotId,
        deliveryDate,
      },
      panelClass: ['wide-dialog', 'mobile-modal', 'order-schedule-dialog'],
    });

    dialogRef.componentInstance.deliveryTimeChanged
      .pipe(
        filter((orderInfo) => !!orderInfo),
        takeUntil(this.getDestroyInterceptor())
      )
      .subscribe((orderInfo: OrderInfoDTO) => {
        this.order = orderInfo;
        this._cdr.detectChanges();
      });
  }

  startAdditionalOrderMode(orderId: number): void {
    this._additionalOrderService.start(orderId).subscribe(() => {
      this._router.navigate([ROUTE_HOME]);
    });
  }
}
