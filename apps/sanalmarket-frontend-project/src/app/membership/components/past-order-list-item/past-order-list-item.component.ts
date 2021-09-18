import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { CheckoutAdditionalService } from '@fe-commerce/line-checkout';
import { AppStateService, PortfolioEnum } from '@fe-commerce/core';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCartPlus, faChevronRight, faFileInvoice } from '@fortawesome/pro-regular-svg-icons';
import { faQuestionCircle } from '@fortawesome/pro-solid-svg-icons';
import { OrderDTO, OrderItemInfoDTO, SimpleOrderInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { ROUTE_HOME } from '../../../routes';

import CollectionStatusEnum = OrderDTO.CollectionStatusEnum;
import ScheduleTypeEnum = OrderDTO.ScheduleTypeEnum;

@Component({
  selector: 'sm-past-order-list-item',
  templateUrl: './past-order-list-item.component.html',
  styleUrls: ['./past-order-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PastOrderListItemComponent {
  @Input() order: SimpleOrderInfoDTO;
  @Input() isActiveOrder: boolean;
  @Output() openOrderDetails = new EventEmitter<SimpleOrderInfoDTO>();
  @Output() downloadInvoice = new EventEmitter<number>();
  @Output() openOrderFeedback = new EventEmitter<void>();

  private _invoiceIcon = faFileInvoice;
  private _chevronRightIcon = faChevronRight;
  private _cartPlusIcon = faCartPlus;
  private _questionIcon = faQuestionCircle;

  constructor(
    private _additionalOrderService: CheckoutAdditionalService,
    private _router: Router,
    private _appStateService: AppStateService
  ) {}

  /**
   * 1. Cancelled -> we need to check cancelled property for this only
   * 2. New Pending ->
   * When order is created by user, deliveryStatus is not defined yet
   * So we can understand that if deliveryStatus is undefined
   * then order is just created and its status must be NEW_PENDING
   * After 1 minute, after deliveryStatus is defined,
   * we need to check collectipnStatus and there is two status for this:  NEW_PENDING , IN_POOL
   * 3. Others -> collectionStatus
   */
  getStatus(): CollectionStatusEnum {
    return this.order.line.cancelled
      ? CollectionStatusEnum.Cancelled
      : !this.order.line.deliveryStatus
      ? CollectionStatusEnum.NewPending
      : this.order.line.collectionStatus;
  }
  getInvoiceIcon(): IconProp {
    return this._invoiceIcon;
  }

  getChevronRightIcon(): IconProp {
    return this._chevronRightIcon;
  }

  getCartPlusIcon(): IconProp {
    return this._cartPlusIcon;
  }

  getFirstItems(number: number): OrderItemInfoDTO[] {
    return this.order.itemInfos.slice(0, number);
  }

  getQuestionIcon(): IconProp {
    return this._questionIcon;
  }

  getMainOrderId(): number {
    return this.order.line.parentId;
  }

  isAdditionalOrder(): boolean {
    return this.order.line.type === 'ADDITIONAL';
  }

  isMoreProductInfoVisible(): boolean {
    return this.getMoreProductInfoAmount() > 0;
  }

  getMoreProductInfoAmount(): number {
    return this.order.itemInfos.length - this.order.itemInfos.slice(0, 3).length;
  }

  getDeliveryDate(): string {
    return new Date(this.order?.line.deliveryDate).toLocaleDateString('tr-TR');
  }

  getInstantDeliveryTime(): number {
    return this.order.line.etaInfo.eta;
  }

  isInstantDelivery(): boolean {
    return this.order.line.scheduleType === ScheduleTypeEnum.Instant;
  }

  isOrderEmpty(): boolean {
    return !this.order;
  }

  isOrderCancelled(): boolean {
    return this.order.line.cancelled;
  }

  isHemenPortfolio(): boolean {
    return this._appStateService.getPortfolio() === PortfolioEnum.HEMEN;
  }

  onClickOrderDetail(): void {
    this.openOrderDetails.emit(this.order);
  }

  onClickOrderHelp(): void {
    this.openOrderFeedback.emit();
  }

  onClickDownloadInvoice(): void {
    this.downloadInvoice.emit(this.order.line.id);
  }

  startAdditionalOrderMode(): void {
    this._additionalOrderService.start(this.order.line.id).subscribe(() => {
      this._router.navigate([ROUTE_HOME]);
    });
  }
}
