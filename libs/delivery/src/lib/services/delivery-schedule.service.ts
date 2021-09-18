import { Injectable } from '@angular/core';

import { LoggingService, UserService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { EMPTY, ReplaySubject } from 'rxjs';
import { DeliveryRestControllerService, ScheduleInfoDto } from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class DeliveryScheduleService extends SubscriptionAbstract {
  private _scheduleInfo$ = new ReplaySubject<ScheduleInfoDto>(1);

  constructor(
    private _deliveryScheduleRestService: DeliveryRestControllerService,
    private _userService: UserService,
    private _loggingService: LoggingService
  ) {
    super();
    this.initialize();
  }

  private initialize(): void {
    this._userService.districtId$
      .pipe(takeUntil(this.getDestroyInterceptor()), distinctUntilChanged())
      .subscribe(() => {
        this._getScheduleInfo();
      });
  }

  get scheduleInfo$() {
    return this._scheduleInfo$.asObservable();
  }

  private _getScheduleInfo() {
    this._deliveryScheduleRestService
      .get2()
      .pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        map((response) => response.data)
      )
      .subscribe((data) => {
        this._scheduleInfo$.next(data);
      });
  }
}
