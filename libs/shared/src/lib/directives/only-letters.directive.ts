import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[feOnlyLetters]',
})
export class OnlyLettersDirective {
  constructor(private elRef: ElementRef) {}

  @HostListener('keydown', ['$event'])
  preventNumbers(event) {
    if (!/[a-zçşğöüı\s]/i.test(event.key)) {
      event.preventDefault();
    }
  }
}
