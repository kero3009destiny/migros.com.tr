import { Pipe, PipeTransform } from '@angular/core';

const roundToPrecision = (value: number, afterDecimal: number) => {
  const rounderExponent = 10 ** afterDecimal;
  return Math.round(value * rounderExponent) / rounderExponent;
};

// Makes amount human readable
@Pipe({
  name: 'feFormatAmount',
})
export class FormatAmountPipe implements PipeTransform {
  transform(value: number, unit: string): number {
    return unit === 'GRAM' ? roundToPrecision(value / 1000, 1) : roundToPrecision(value, 0);
  }
}
