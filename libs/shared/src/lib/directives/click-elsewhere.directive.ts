import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[feClickElsewhere]',
})
export class ClickElsewhereDirective {
  @Output() clickElsewhere = new EventEmitter<MouseEvent>();
  @Input() excludeIt: HTMLElement;

  constructor(private _elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (targetElement === this.excludeIt) {
      return;
    }
    if (targetElement && !this._elementRef.nativeElement.contains(targetElement)) {
      this.clickElsewhere.emit(event);
    }
  }
}
