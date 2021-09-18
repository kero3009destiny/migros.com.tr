import { Injectable } from '@angular/core';
import { LoadingIndicatorService, UserService } from '@fe-commerce/core';

import { AdditionalOrderInfoModel, SubscriptionAbstract } from '@fe-commerce/shared';
import { OrderRestControllerService, UserInfoDTO, UserStateInfo } from '@migroscomtr/sanalmarket-angular';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, takeUntil } from 'rxjs/operators';

const initialState = {
  isActive: false,
  orderId: null,
  orderDate: null,
  orderTime: null,
  lastAddableOrderId: null,
  lastAddableOrderDeadlineForAddition: null,
};

@Injectable({
  providedIn: 'root',
})
export class CheckoutAdditionalService extends SubscriptionAbstract {
  private _isActive = new BehaviorSubject<AdditionalOrderInfoModel>(initialState);

  constructor(
    private _userService: UserService,
    private _orderRestService: OrderRestControllerService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {
    super();
    this._subscribeToUserState();
  }

  start(orderId: number): Observable<UserInfoDTO> {
    this._loadingIndicatorService.start();
    return this._orderRestService.startAdditionalOrderMode(orderId).pipe(
      catchError((err) => throwError(err)),
      filter((response) => response.successful),
      switchMap(() => this._userService.getUserObservable()),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  stop(): Observable<UserInfoDTO> {
    this._loadingIndicatorService.start();
    return this._orderRestService.exitAdditionalOrderMode().pipe(
      catchError((err) => throwError(err)),
      filter((response) => response.successful),
      switchMap(() => this._userService.getUserObservable()),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  get isActive$() {
    return this._isActive.asObservable();
  }

  statusChanged(status: AdditionalOrderInfoModel) {
    this._isActive.next({ ...initialState, ...status });
  }

  resetStatus() {
    this._isActive.next(initialState);
  }

  private _subscribeToUserState(): void {
    this._userService
      .getUserState()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((userState) => {
        this.statusChanged({
          isActive: userState.cartMode === UserStateInfo.CartModeEnum.Additional,
          orderId: userState.additionalOrderId ?? null,
          lastAddableOrderId: userState.lastAddableOrderId,
          lastAddableOrderDeadlineForAddition: userState.lastAddableOrderDeadlineForAddition,
        });
      });
  }
}
