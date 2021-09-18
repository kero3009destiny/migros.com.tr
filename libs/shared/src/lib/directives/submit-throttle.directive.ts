import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Directive({
  selector: '[feAppSubmitThrottle]',
})
export class SubmitThrottleDirective implements OnInit, OnDestroy {
  @Input()
  throttleTime = 700;

  @Input()
  throttleFormValid?: boolean;

  @Input()
  formGroup: FormGroup;

  @Output()
  throttleSubmit = new EventEmitter();

  private _submits = new Subject();
  private _subscription: Subscription;

  constructor(private _element: ElementRef) {}

  ngOnInit() {
    this._subscription = this._submits.pipe(throttleTime(this.throttleTime)).subscribe((event: Event) => {
      if (this.throttleFormValid === undefined || this.throttleFormValid === true) {
        this.throttleSubmit.emit(event);
      } else if (this.throttleFormValid !== undefined && this.throttleFormValid === false) {
        event.preventDefault();
        const firstElementWithError: NodeListOf<HTMLInputElement> = this._element.nativeElement.querySelectorAll(
          '.ng-invalid'
        );
        if (firstElementWithError && firstElementWithError.length > 0) {
          firstElementWithError[0].scrollIntoView({
            behavior: 'smooth',
            block: 'end',
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  @HostListener('submit', ['$event'])
  submitEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this._submits.next(event);
  }
}
