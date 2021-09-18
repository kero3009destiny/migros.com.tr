import { Pipe, PipeTransform } from '@angular/core';

// Makes unit Turkish readable
@Pipe({
  name: 'feFormatUnit',
})
export class FormatUnitPipe implements PipeTransform {
  transform(value: string, isGtm?: boolean): string {
    const UNITS = {
      GRAM: 'Kg',
      PACKET: 'Adet',
      PIECE: 'Adet',
    };

    if (isGtm) {
      UNITS.GRAM = 'Gram';
    }
    return UNITS[value];
  }
}
