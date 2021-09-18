import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { ScheduleInfoDto, TimeSlotInfoDto } from '@migroscomtr/sanalmarket-angular';

import { DeliveryTimeInfo, DeliveryType } from '../../models';

@Component({
  selector: 'fe-line-checkout-delivery-type',
  templateUrl: './checkout-delivery-type.component.html',
  styleUrls: ['./checkout-delivery-type.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CheckoutDeliveryTypeComponent implements OnInit {
  @Input() scheduleInfo: ScheduleInfoDto;
  @Input() selectedDeliveryTime: DeliveryTimeInfo;
  @Input() initialDeliveryType: DeliveryType;

  // Component must change closest delivery date with selection of timeslot info.
  @Input() selectedTimeSlotInfo: TimeSlotInfoDto;
  @Output() typeSelect: EventEmitter<string> = new EventEmitter<string>();

  private selectedDeliveryType: DeliveryType;

  readonly INSTANT = DeliveryType.INSTANT;
  readonly TIMESLOT = DeliveryType.TIMESLOT;

  ngOnInit(): void {
    this.selectedDeliveryType = this.initialDeliveryType;
  }

  onClickDeliveryType(type: DeliveryType): void {
    this.typeSelect.emit(type);
  }

  getClosestDeliveryTimeSlot(): string | undefined {
    return this.scheduleInfo.firstAvailableTimeSlot?.timeSlot;
  }

  getClosestDeliveryDate(): string {
    return this.scheduleInfo.firstAvailableDate;
  }

  getSelectedTimeSlotDate(): string | undefined {
    return this.selectedDeliveryTime?.date;
  }

  getSelectedTimeSlot(): string | undefined {
    return this.selectedDeliveryTime?.timeSlot?.timeSlot;
  }

  getDeliveryPrice(deliveryType: DeliveryType): number | undefined {
    return deliveryType === DeliveryType.INSTANT
      ? this.scheduleInfo.instantDeliveryFee
      : this.selectedDeliveryTime
      ? this.selectedDeliveryTime?.timeSlot?.deliveryPrice
      : this.scheduleInfo.firstAvailableTimeSlot?.deliveryPrice;
  }

  getEta(): number {
    return this.scheduleInfo.instantDeliveryDurationInMins;
  }

  getDay(): string | undefined {
    return this.selectedDeliveryTime ? this.getSelectedTimeSlotDate() : this.getClosestDeliveryDate();
  }

  getTimeSlot(): string | undefined {
    return this.selectedDeliveryTime ? this.getSelectedTimeSlot() : this.getClosestDeliveryTimeSlot();
  }

  isCapacityFull(): boolean {
    return !!this.scheduleInfo.firstAvailableTimeSlot;
  }

  isDeliveryTypeInstant(): boolean {
    return this.selectedDeliveryType === DeliveryType.INSTANT;
  }

  isDeliveryTypeTimeSlot(): boolean {
    return this.selectedDeliveryType === DeliveryType.TIMESLOT;
  }
}
