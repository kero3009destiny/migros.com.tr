import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[feTurnDeepInputAutocompleteOff]',
})
export class TurnDeepInputAutocompleteOffDirective implements AfterViewInit {
  constructor(private _elementRef: ElementRef) {}

  ngAfterViewInit() {
    this._elementRef.nativeElement.getElementsByTagName('input')[0].setAttribute('autocomplete', 'off');
  }
}
