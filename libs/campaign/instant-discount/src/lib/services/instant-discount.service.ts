import { Injectable } from '@angular/core';

import { LoadingIndicatorService, LoggingService } from '@fe-commerce/core';
import { SidePaymentDiscountInfo, SidePaymentInfo, SidePaymentService } from '@fe-commerce/line-payment';
import {
  AbstractInstantDiscountModel,
  InstantDiscountInfo,
  InstantDiscountModel,
  InstantDiscountsModel,
} from '@fe-commerce/shared';

import { catchError, finalize, map } from 'rxjs/operators';

import { BehaviorSubject, EMPTY, Observable, ReplaySubject } from 'rxjs';
import { BkmTokenFormBean, CheckoutRestControllerService } from '@migroscomtr/sanalmarket-angular';

import PaymentTypeEnum = BkmTokenFormBean.PaymentTypeEnum;

type InstantDiscountReducerFunction = (
  instantDiscounts: AbstractInstantDiscountModel,
  paymentType: PaymentTypeEnum
) => { [key: string]: InstantDiscountModel };

interface InstantDiscountOperator {
  reducer: InstantDiscountReducerFunction;
  getterById: (id: number) => InstantDiscountInfo;
}

@Injectable({
  providedIn: 'root',
})
export class InstantDiscountService implements SidePaymentService {
  private _instantDiscounts: InstantDiscountsModel = {};
  private _instantDiscounts$ = new BehaviorSubject<InstantDiscountsModel>({});
  private _appliedInstantDiscount$ = new ReplaySubject<InstantDiscountInfo>(1);

  constructor(
    private _checkoutRestService: CheckoutRestControllerService,
    private _loggingService: LoggingService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  getInstantDiscounts(paymentType: PaymentTypeEnum): Observable<InstantDiscountModel> {
    return this._instantDiscounts$.pipe(map((data) => data[paymentType]));
  }

  getAppliedInstantDiscount(paymentType: PaymentTypeEnum): Observable<InstantDiscountInfo> {
    return this._appliedInstantDiscount$.pipe(
      map((data) => {
        if (data?.paymentType === paymentType) {
          return data;
        }
        return null;
      })
    );
  }

  getInstantDiscount(): Observable<InstantDiscountInfo> {
    return this._appliedInstantDiscount$.asObservable();
  }

  getUsed$(): Observable<SidePaymentDiscountInfo> {
    return this.getInstantDiscount().pipe(
      map((usedDiscount) => {
        return usedDiscount === null
          ? null
          : {
              type: 'INSTANT_DISCOUNT',
              value: usedDiscount.id,
              discount: usedDiscount.amount,
            };
      })
    );
  }

  use(usedSidePayment: SidePaymentInfo, checkoutId: number) {
    const paymentType = usedSidePayment.mainPaymentType;
    const discountId = usedSidePayment.value;
    if (!this._instantDiscounts[paymentType] || this.isDiscountNotFoundById(discountId, paymentType)) {
      throw new Error(
        `Unknown instant discount! Instant discounts: ${JSON.stringify(
          this._instantDiscounts
        )}, paymentType: ${paymentType}, discountId: ${discountId}`
      );
    }
    const operator = this.getInstantDiscountOperatorOfPaymentType(paymentType);
    this._appliedInstantDiscount$.next(operator.getterById(discountId as number));
  }

  isDiscountNotFoundById(id: number | string, paymentType: PaymentTypeEnum): boolean {
    return !this.getInstantDiscountOperatorOfPaymentType(paymentType)?.getterById?.(id as number);
  }

  cancel(): void {
    this._appliedInstantDiscount$.next(null);
  }

  fetchInstantDiscounts(checkoutId: number, cardNumbers: string[], paymentType: PaymentTypeEnum): void {
    if (this._instantDiscounts[paymentType]) {
      return;
    }
    this._loadingIndicatorService.start();
    this._checkoutRestService
      .getInstantDiscounts(checkoutId, {
        cardNumbers,
        paymentType,
      })
      .pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        map((response) => response.data),
        map((data) => {
          const operator = this.getInstantDiscountOperatorOfPaymentType(paymentType);
          if (!operator) {
            throw new Error(
              `Trying to fetch instant discounts for payment type: ${paymentType}
              without instant discount operator defined in PAYMENT_TYPE_INSTANT_DISCOUNT_OPERATOR_MAP`
            );
          }
          const reducerFunction = operator.reducer;
          return reducerFunction(data, paymentType);
        }),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((updatedData) => {
        const updatedInstantDiscounts = { ...this._instantDiscounts, [paymentType]: updatedData };
        this._instantDiscounts$.next(updatedInstantDiscounts);
        this._instantDiscounts = updatedInstantDiscounts;
      });
  }

  groupInstantDiscountsById(
    instantDiscounts: AbstractInstantDiscountModel,
    paymentType: PaymentTypeEnum
  ): { [key: number]: InstantDiscountModel } {
    return Object.entries(instantDiscounts).reduce(
      (prev, [_cardNumber, instantDiscountInfo]) => ({
        ...prev,
        [instantDiscountInfo.id]: { ...instantDiscountInfo, paymentType },
      }),
      {}
    );
  }

  groupInstantDiscountsByCardNumber(
    instantDiscounts: AbstractInstantDiscountModel,
    paymentType: PaymentTypeEnum
  ): { [key: string]: InstantDiscountModel } {
    return Object.entries(instantDiscounts).reduce(
      (prev, [_cardNumber, instantDiscountInfo]) => ({
        ...prev,
        [_cardNumber]: { ...instantDiscountInfo, paymentType },
      }),
      {}
    );
  }

  getByIdFromIdMappedDiscounts(id: number, paymentType: PaymentTypeEnum): InstantDiscountInfo {
    return this._instantDiscounts[paymentType][id];
  }

  getByIdFromNotIdMappedDiscounts(id: number, paymentType: PaymentTypeEnum): InstantDiscountInfo {
    return Object.values(this._instantDiscounts[paymentType] ?? {}).find(
      (instantDiscountInfo) => instantDiscountInfo.id === id
    );
  }

  getInstantDiscountOperatorOfPaymentType(paymentType: PaymentTypeEnum): InstantDiscountOperator {
    switch (paymentType) {
      case PaymentTypeEnum.Masterpass:
        return {
          reducer: this.groupInstantDiscountsByCardNumber,
          getterById: (id: number) => this.getByIdFromNotIdMappedDiscounts(id, PaymentTypeEnum.Masterpass),
        };
      default:
        return {
          reducer: this.groupInstantDiscountsById,
          getterById: (id: number) => this.getByIdFromIdMappedDiscounts(id, paymentType),
        };
    }
  }
}
