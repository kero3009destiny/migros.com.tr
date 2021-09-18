import { Directive, ElementRef, HostListener } from '@angular/core';

const allowedChars = new Set('0123456789'.split(''));
allowedChars.add('Backspace');
allowedChars.add('Enter');
allowedChars.add('ArrowLeft');
allowedChars.add('ArrowRight');

@Directive({
  selector: 'input[feOnlyNumbers]',
})
export class OnlyNumbersDirective {
  constructor(private _elementRef: ElementRef) {}

  @HostListener('keydown', ['$event'])
  preventNonNumbers(event: KeyboardEvent) {
    const key = event.key;
    if (!allowedChars.has(key)) {
      event.preventDefault();
    }
  }
}
