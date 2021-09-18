import { DatePipe } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { DayNamePipe } from '@fe-commerce/shared';

import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { faMapMarkerAlt } from '@fortawesome/pro-solid-svg-icons';
import { TimeSlotInfoDto } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-closest-delivery-time',
  templateUrl: './closest-delivery-time.component.html',
  styleUrls: ['./closest-delivery-time.component.scss'],
})
export class ClosestDeliveryTimeComponent {
  @Input() location: string;

  // ICONS
  closeIcon = faTimes;
  mapMarkerAlt = faMapMarkerAlt;

  // READONLY
  readonly TODAY = 'Bugün';
  readonly TOMORROW = 'Yarın';

  // PIPES
  private datePipe = new DatePipe('tr');
  private dayNamePipe = new DayNamePipe();

  constructor(@Inject(MAT_DIALOG_DATA) public data, private dialogRef: MatDialogRef<ClosestDeliveryTimeComponent>) {}

  getLocationName(): string {
    return this.data.locationName;
  }

  getDateTimeSlotMapKeys(): string[] {
    return Object.keys(this.data.dateTimeSlotMap);
  }

  getDateTimeslotsOfDay(day: string): TimeSlotInfoDto {
    const timeSlothsAreFull = this.data.dateTimeSlotMap[day].length === 0;
    const fullTimeSlot = Object.create(TimeSlotInfoDto);
    fullTimeSlot.active = false;
    return timeSlothsAreFull ? [fullTimeSlot] : this.data.dateTimeSlotMap[day];
  }

  getDateTimeslotsOfDayValue(day: any): void {
    if (day.key === 'timeSlot') {
      return day.value;
    }
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

  getDate(stringDate:string): string {
    return this.datePipe.transform(new Date(stringDate), 'dd MMMM').toLocaleUpperCase('tr');
  }

  onClickClose(): void {
    this.dialogRef.close();
  }
}
