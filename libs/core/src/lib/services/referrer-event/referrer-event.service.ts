import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SubscriptionAbstract } from '@fe-commerce/shared';

import { EMPTY, Observable, Observer } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { ScreenViewRestControllerService } from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class ReferrerEventService extends SubscriptionAbstract {
  private _counter = 1;
  private _counterRange = 1000000;
  private _rangeDecimals = '000000';
  private _currentObjectId: string;
  private _screenId: string;

  constructor(
    private _screenViewService: ScreenViewRestControllerService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {
    super();
  }

  pushScreen(screenName: string): Observable<void> {
    const newEventId = this.generateNewEventId();
    const referrerEventId = this._router.getCurrentNavigation().extras.state?.referrerEventId;

    return new Observable<void>((observer: Observer<void>) => {
      if (referrerEventId) {
        this._screenId = referrerEventId;
      }
      this._screenViewService
        .onViewScreen({
          // @ts-expect-error see this.generateNewEventId
          eventId: newEventId,
          screenName,
        })
        .pipe(
          catchError(() => EMPTY),
          takeUntil(this.getDestroyInterceptor())
        )
        .subscribe();
      this._screenId = newEventId;
      observer.next();
      observer.complete();
    });
  }

  getCurrentEventId(): string {
    if (this._currentObjectId) {
      const currentObjectId = this._currentObjectId;
      this.clearObjectId();
      return currentObjectId;
    }
    if (this._screenId) {
      return this._screenId;
    }
    return null;
  }

  setObjectId(id: string): void {
    this._currentObjectId = id;
  }

  clearObjectId(): void {
    this._currentObjectId = null;
  }

  generateNewEventId(): string {
    /*
      Because of generated id bigger than MAX_SAFE_INTEGER
      and BigInt type does not exist below es2020.
      Id calculating handled with string concats
    */
    const time = new Date().getTime().toString();
    const count = (this._counter % this._counterRange).toString();
    this._counter++;
    const uniqueCount = this._rangeDecimals.substring(0, this._rangeDecimals.length - count.length) + count;
    return time + uniqueCount;
  }
}
