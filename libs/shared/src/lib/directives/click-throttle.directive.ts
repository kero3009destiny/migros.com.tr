import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Directive({
  selector: '[feAppClickThrottle]',
})
export class ClickThrottleDirective implements OnInit, OnDestroy {
  @Input() throttleTime = 1000;

  @Output() throttleClick = new EventEmitter<Event>();

  private _clicks = new Subject();
  private _subscription: Subscription;

  constructor(private _element: ElementRef) {}

  ngOnInit() {
    this._subscription = this._clicks.pipe(throttleTime(this.throttleTime)).subscribe((event: Event) => {
      this.throttleClick.emit(event);
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  submitEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this._clicks.next(event);
  }
}
