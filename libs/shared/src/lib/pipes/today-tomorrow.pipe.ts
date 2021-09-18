import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

import { DayNamePipe } from './day-name.pipe';

@Pipe({
  name: 'feTodayTomorrow',
})
export class TodayTomorrowPipe implements PipeTransform {
  private dayNamePipe = new DayNamePipe();
  private datePipe = new DatePipe('tr');

  transform(value: string, onlyName = false) {
    const dateToTransform = new Date(value);

    if (this.isToday(dateToTransform)) {
      return 'Bugün';
    }

    const isDateToTransformTomorrow = this.isTomorrow(dateToTransform);
    if (onlyName) {
      return isDateToTransformTomorrow ? 'Yarın' : this.dayNamePipe.transform(value);
    } else {
      const friendlyDateFormat = this.datePipe.transform(value, 'dd MMMM EEEE');
      return isDateToTransformTomorrow ? `${friendlyDateFormat} (Yarın)` : friendlyDateFormat;
    }
  }

  isToday(date: Date): boolean {
    const now = new Date();
    return this.isSameDay(date, now);
  }

  isTomorrow(date: Date): boolean {
    const millisUntilTomorrow = 24 * 60 * 60 * 1000;
    const now = new Date();
    const tomorrowInMillis = now.getTime() + millisUntilTomorrow;
    const tomorrow = new Date(tomorrowInMillis);
    return this.isSameDay(date, tomorrow);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() == date2.getDate() &&
      date1.getMonth() == date2.getMonth() &&
      date1.getFullYear() == date2.getFullYear()
    );
  }
}
