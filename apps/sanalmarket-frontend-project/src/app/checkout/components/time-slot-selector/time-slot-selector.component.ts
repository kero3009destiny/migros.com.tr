import { DatePipe } from '@angular/common';
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

import { LoadingIndicatorService } from '@fe-commerce/core';
import { CheckoutService, DeliveryTimeInfo } from '@fe-commerce/line-checkout';
import { DayNamePipe, FormatPricePipe, SubscriptionAbstract } from '@fe-commerce/shared';

import { delay, filter, map, takeUntil, tap } from 'rxjs/operators';

import { of } from 'rxjs';
import { faInfoCircle, IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { ScheduleInfoDto, TimeSlotInfoDto } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-time-slot-selector',
  templateUrl: './time-slot-selector.component.html',
  styleUrls: ['./time-slot-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TimeSlotSelectorComponent extends SubscriptionAbstract implements OnInit {
  @Output() deliveryTimeSelected = new EventEmitter<DeliveryTimeInfo>();
  @Input() currentTimeSlotId: number;

  // ICON
  infoIcon: IconDefinition = faInfoCircle;

  // READONLY
  readonly TODAY = 'Bugün';
  readonly TOMORROW = 'Yarın';
  readonly START_HOUR_PASSED = 'START_HOUR_PASSED';
  readonly CAPACITY_FILLED = 'CAPACITY_FILLED';
  readonly CAPACITY_FILLED_TEMPLATE_TEXT = 'Kapasite Dolu';
  readonly FREE = 'Ücretsiz';

  // DATA
  protected dateTimeSlotMap: { [key: string]: Array<TimeSlotInfoDto> } = {};
  protected days: string[];

  // STATE
  protected selectedDay: string;
  protected selectedTimeSlotId: number;
  protected loading = false;
  protected firstAvailableDate: number | string;
  private fadeAnimationState: boolean;
  private datePipe = new DatePipe('tr');
  private dayNamePipe = new DayNamePipe();
  private currentTimeSlotVisible = false;

  constructor(
    private _checkoutService: CheckoutService,
    protected cdr: ChangeDetectorRef,
    private formatPricePipe: FormatPricePipe,
    protected _loadingIndicatorService: LoadingIndicatorService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loading = true;
    this.subscribeToCheckout();
  }

  getDayName(stringDate: string, index?: number, transformFirstTwoDays: boolean = true): string {
    if (transformFirstTwoDays) {
      if (index === 0) {
        return this.TODAY;
      }
      if (index === 1) {
        return this.TOMORROW;
      }
    }
    return this.dayNamePipe.transform(stringDate);
  }

  getDate(stringDate): string {
    return this.datePipe.transform(new Date(stringDate), 'dd MMMM');
  }

  getTimeSlotTime(timeSlotId: number): string {
    const timeSlot = this.dateTimeSlotMap[this.selectedDay].find((slot) => {
      return slot.id === timeSlotId;
    });
    return timeSlot['timeSlot'];
  }

  getDateTimeSlots(): TimeSlotInfoDto[] {
    return this.dateTimeSlotMap[this.selectedDay];
  }

  getSelectedDay(): string {
    return this.selectedDay;
  }

  getTimeSlotPrice(timeSlotId: number): string {
    if (this.isTimeSlotDisabled(timeSlotId)) {
      return this.CAPACITY_FILLED_TEMPLATE_TEXT;
    }
    const timeSlot = this.dateTimeSlotMap[this.selectedDay].find((slot) => {
      return slot.id === timeSlotId;
    });
    const price = timeSlot['deliveryPrice'];
    if (price === 0) {
      return this.FREE;
    }
    return `${this.formatPricePipe.transform(price)} ₺`;
  }

  getDays(): string[] {
    return this.days;
  }

  getFadeAnimationState(): boolean {
    return this.fadeAnimationState;
  }

  setFadeAnimationState(condition: boolean, duration: number): void {
    of(true)
      .pipe(delay(duration))
      .subscribe(() => {
        this.fadeAnimationState = condition;
        this.cdr.detectChanges();
      });
  }

  isCapacityFullForSpecificDayVisible(): boolean {
    return this.isAllDaysAreFullVisible() ? false : this.isSlotsFullForSpecificDay(this.getSelectedDay());
  }

  isAvailableTimeSlotsVisible(): boolean {
    return !this.isAllDaysAreFull() && !this.isSlotsFullForSpecificDay(this.getSelectedDay());
  }

  isLoading(): boolean {
    return this.loading;
  }

  isSlotsFullForSpecificDay(stringDate): boolean {
    if (this.isAllDaysAreFull()) {
      return true;
    }
    const actives = this.dateTimeSlotMap[stringDate].filter((item) => {
      return item.active;
    });
    return actives.length === 0;
  }

  isAllDaysAreFullVisible(): boolean {
    return this.isAllDaysAreFull();
  }

  isAllDaysAreFull(): boolean {
    // if firstAvailableDate is null, means all days are full.
    return this.firstAvailableDate === null;
  }

  isDaySelected(day: string): boolean {
    return day === this.selectedDay;
  }

  isTimeSlotSelected(timeSlotId: number): boolean {
    return timeSlotId === this.selectedTimeSlotId;
  }

  isStartHourPassed(timeSlotId: number): boolean {
    const timeSlot = this.dateTimeSlotMap[this.selectedDay].filter((slot) => {
      return slot.id === timeSlotId && slot.status === this.START_HOUR_PASSED;
    });
    return timeSlot.length > 0;
  }

  isTimeSlotDisabled(timeSlotId: number): boolean {
    const timeSlot = this.dateTimeSlotMap[this.selectedDay].filter((slot) => {
      return slot.id === timeSlotId && !slot.active;
    });
    return timeSlot.length > 0;
  }

  onClickDay(stringDate): void {
    this.fadeAnimationState = false;
    this.setFadeAnimationState(true, 100);
    this.selectedDay = stringDate;
  }

  onClickTimeSlot(timeSlot: TimeSlotInfoDto): void {
    this.deliveryTimeSelected.emit({
      timeSlot: timeSlot,
      date: this.selectedDay,
    });
    this.selectedTimeSlotId = timeSlot.id;
  }

  /**
   * This method will set selected day by checking firstAvailableDate
   * If there is no available date then it'll select first one
   * If there is timeSlotId it'll select matched day
   * @private
   */
  protected _setSelectedDay(): void {
    let index: number;

    if (this.currentTimeSlotId) {
      index = this.days.findIndex((day) =>
        this.dateTimeSlotMap[day].some((timeSlot) => timeSlot.id === this.currentTimeSlotId)
      );
    } else {
      index = this.firstAvailableDate
        ? this.days.findIndex((day) => new Date(day).getDay() === new Date(this.firstAvailableDate).getDay())
        : -1;
    }

    this.selectedDay = index > -1 ? this.days[index] : this.days[0];
  }

  private subscribeToCheckout(): void {
    this._checkoutService
      .getScheduleInfo()
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
        this.setCurrentDeliveryTime();
        this.setFadeAnimationState(true, 100);
        this._loadingIndicatorService.stop();
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  private setCurrentDeliveryTime(): void {
    if (this.currentTimeSlotId && !this.currentTimeSlotVisible) {
      const timeSlot = this.dateTimeSlotMap[this.selectedDay].find((slot) => {
        return slot.id === this.currentTimeSlotId;
      });
      this.onClickTimeSlot(timeSlot);
      this.currentTimeSlotVisible = true;
    }
  }
}
