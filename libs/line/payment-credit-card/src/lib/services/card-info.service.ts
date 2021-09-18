import { Injectable } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';

import { ReplaySubject, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import {
  CardInfoBean,
  CheckoutRestControllerService,
  InstallmentInfoDTO,
  RewardInfo,
  RewardInfoDTO,
} from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class CardInfoService {
  private _instalmentInfo$ = new ReplaySubject<InstallmentInfoDTO>(1);
  private _rewardInfo$ = new ReplaySubject<RewardInfoDTO>(1);

  constructor(
    private _checkoutRestService: CheckoutRestControllerService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  getCardInfo(checkoutId: number, cardInfoBean: CardInfoBean) {
    this._loadingIndicatorService.start();
    this._checkoutRestService
      .getCardInfo(checkoutId, cardInfoBean)
      .pipe(
        catchError((err) => throwError(err)),
        map((response) => response.data),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((data) => {
        this._instalmentInfo$.next(data.installmentInfo);
        this._rewardInfo$.next(data.rewardInfo);
      });
  }

  get installmentInfo$() {
    return this._instalmentInfo$.asObservable();
  }

  get rewardInfo$() {
    return this._rewardInfo$.asObservable();
  }

  cleanUpRewardInfo() {
    this._rewardInfo$.next({ available: false, rewardInfos: [] } as RewardInfoDTO);
  }
}
