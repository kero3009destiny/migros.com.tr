import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { OrderService } from '@fe-commerce/membership';
import { FormatPricePipe } from '@fe-commerce/shared';

import { filter, finalize, map, takeUntil, tap } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';
import {
  OrderInfoDTO,
  ScheduleInfoDto,
  TimeslotChangeRequest,
  TimeSlotInfoDto,
} from '@migroscomtr/sanalmarket-angular';

import { TimeSlotSelectorComponent } from '../../../checkout/components/time-slot-selector/time-slot-selector.component';

class OrderRescheduleDialogData {
  orderId: number;
  orderTimeSlotId: number;
  deliveryDate: string;
}

@Component({
  selector: 'sm-order-reschedule-dialog',
  templateUrl: './order-reschedule-dialog.component.html',
  styleUrls: ['./order-reschedule-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderRescheduleDialogComponent extends TimeSlotSelectorComponent implements OnInit {
  private _showSuccessMessage = false;
  private _order: OrderInfoDTO;

  @Output() deliveryTimeChanged = new EventEmitter<OrderInfoDTO>();

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: OrderRescheduleDialogData,
    private _orderService: OrderService,
    _checkoutService: CheckoutService,
    cdr: ChangeDetectorRef,
    formatPricePipe: FormatPricePipe,
    _loadingIndicatorService: LoadingIndicatorService
  ) {
    super(_checkoutService, cdr, formatPricePipe, _loadingIndicatorService);
  }

  ngOnInit() {
    this._loadingIndicatorService.start();
    this.subscribeToOrderService();
  }

  getCloseIcon(): IconProp {
    return faTimes;
  }

  getCheckIcon(): IconProp {
    return faCheckCircle;
  }

  isSuccessMessageVisible(): boolean {
    return this._showSuccessMessage;
  }

  isDateMapEmpty(): boolean {
    return Object.keys(this.dateTimeSlotMap).length === 0;
  }

  onClickTimeSlot(timeSlot: TimeSlotInfoDto): void {
    this._loadingIndicatorService.start();
    this._showSuccessMessage = false;
    const timeSlotChangeRequest: TimeslotChangeRequest = {
      date: this.selectedDay,
      timeslotId: timeSlot.regionTimeSlotId,
    };

    this._orderService
      .reschedule(this.data.orderId, timeSlotChangeRequest)
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((orderInfo) => !!orderInfo),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((orderInfo) => {
        this._order = orderInfo;
        this._showSuccessMessage = true;
        this.cdr.markForCheck();
        this.deliveryTimeChanged.emit(this._order);
      });

    super.onClickTimeSlot(timeSlot);
  }

  subscribeToOrderService(): void {
    this._orderService
      .getOrderScheduleInfo(this.data.orderId)
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((scheduleInfo: ScheduleInfoDto) => !!Object.keys(scheduleInfo).length),
        tap((scheduleInfo: ScheduleInfoDto) => {
          this.firstAvailableDate = scheduleInfo.firstAvailableDate;
        }),
        map((scheduleInfo: ScheduleInfoDto) => scheduleInfo.dateTimeSlotMap)
      )
      .subscribe((dateTimeSlotMap: { [key: string]: Array<TimeSlotInfoDto> }) => {
        this.dateTimeSlotMap = dateTimeSlotMap;
        this.days = Object.keys(dateTimeSlotMap);
        this._setSelectedDay();
        this.setFadeAnimationState(true, 100);
        this._loadingIndicatorService.stop();
        this.cdr.detectChanges();
      });
  }

  _setSelectedDay(): void {
    if (!this._order) {
      const timezoneOffset = new Date(this.data.deliveryDate).getTimezoneOffset();
      this.selectedDay = new Date(+this.data.deliveryDate - timezoneOffset * 60 * 1000).toISOString().split('T')[0];
      this.selectedTimeSlotId = this.data.orderTimeSlotId;
    } else {
      this.selectedDay = new Date(this._order.line.deliveryDate).toISOString().slice(0, 10);
      this.selectedTimeSlotId = this._order.line.timeSlotId;
    }
  }
}
