import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'feFormatPrice',
})
export class FormatPricePipe implements PipeTransform {
  transform(value: string | number, defaultSeparator = ','): string {
    const defaultValue = (parseFloat(value as string) / 100)
      .toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace(',', defaultSeparator);
    return defaultValue;
  }
}
