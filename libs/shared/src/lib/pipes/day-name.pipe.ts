import { Pipe, PipeTransform } from '@angular/core';

export const NAME_OF_DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

@Pipe({
  name: 'dayName',
})
export class DayNamePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return;
    }
    return NAME_OF_DAYS[new Date(`${value}`).getDay()]; // TODO: timezone
  }
}
