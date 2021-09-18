import { Directive, OnDestroy } from '@angular/core';

import { Observable, Subject } from 'rxjs';

@Directive({
  selector: '[feSubscriptionAbstract]',
})
export abstract class SubscriptionAbstractDirective implements OnDestroy {
  protected destroyInterceptor$: Subject<boolean> = new Subject();

  getDestroyInterceptor(): Observable<boolean> {
    return this.destroyInterceptor$.asObservable();
  }

  destroySubscriptions(): void {
    this.destroyInterceptor$.next(true);
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }
}
