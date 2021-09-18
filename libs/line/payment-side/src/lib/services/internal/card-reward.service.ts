import { Injectable } from '@angular/core';

import { SidePaymentDiscountInfo, SidePaymentInfo, SidePaymentService } from '@fe-commerce/line-payment';

import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CardRewardService implements SidePaymentService {
  private _usedReward$ = new ReplaySubject<SidePaymentInfo>(1);

  use(usedSidePayment: SidePaymentInfo, checkoutId: number) {
    this._usedReward$.next(usedSidePayment);
  }

  cancel() {
    this._usedReward$.next(null);
  }

  getUsed$(): Observable<SidePaymentDiscountInfo> {
    return this._usedReward$.pipe(
      map((usedReward) => {
        return usedReward === null ? null : { ...usedReward, discount: usedReward.value as number };
      })
    );
  }
}
