import { Injectable } from '@angular/core';

import { LoggingService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import {
  FeedbackReasonInfo,
  FeedbackRestControllerService,
  FeedbackResult,
  OrderFeedbackFormBean,
} from '@migroscomtr/sanalmarket-angular';

@Injectable()
export class OrderRatingService extends SubscriptionAbstract {
  private orderScoreReasons$ = new BehaviorSubject<FeedbackReasonInfo[]>([]);
  private deliveryScoreReasons$ = new BehaviorSubject<FeedbackReasonInfo[]>([]);

  constructor(private _feedbackService: FeedbackRestControllerService, private _loggingService: LoggingService) {
    super();
  }

  getOrderScoreReasons(): Observable<FeedbackReasonInfo[]> {
    return this.orderScoreReasons$.asObservable();
  }

  getDeliveryScoreReasons(): Observable<FeedbackReasonInfo[]> {
    return this.deliveryScoreReasons$.asObservable();
  }

  fetchAllScoreReasons(): void {
    this.fetchScoreReasons('ORDER_SCORE');
    this.fetchScoreReasons('DELIVERY_SCORE');
  }

  fetchScoreReasons(category: 'DELIVERY_SCORE' | 'ORDER_SCORE'): void {
    this._feedbackService
      .getReasons(category)
      .pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        map((response) => response.data)
      )
      .subscribe((data: FeedbackReasonInfo[]) => {
        if (category === 'DELIVERY_SCORE') {
          this.deliveryScoreReasons$.next(data);
        }
        if (category === 'ORDER_SCORE') {
          this.orderScoreReasons$.next(data);
        }
      });
  }

  addCompleteFeedback(
    orderId: number,
    orderRatingBody: OrderFeedbackFormBean,
    deliveryRatingBody: OrderFeedbackFormBean
  ): Observable<[FeedbackResult, FeedbackResult]> {
    return combineLatest([
      this.addOrderFeedback(orderId, orderRatingBody),
      this.addOrderFeedback(orderId, deliveryRatingBody),
    ]);
  }

  addOrderFeedback(orderId: number, ratingBody: OrderFeedbackFormBean): Observable<FeedbackResult> {
    return this._feedbackService.addOrderFeedback(orderId, ratingBody).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      takeUntil(this.getDestroyInterceptor()),
      map((response) => response.data)
    );
  }
}
