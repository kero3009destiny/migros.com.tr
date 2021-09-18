import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { InstantDiscountInfo, InstantDiscountModel, ToasterService } from '@fe-commerce/shared';

import { Observable, Subscription } from 'rxjs';

import { BkmTokenFormBean } from '@migroscomtr/sanalmarket-angular';

import { InstantDiscountService } from '../../services';
import PaymentTypeEnum = BkmTokenFormBean.PaymentTypeEnum;

@Component({
  selector: 'fe-campaign-instant-discount',
  templateUrl: './instant-discount.component.html',
  styleUrls: ['./instant-discount.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstantDiscountComponent implements OnInit, OnDestroy {
  @Input() cardNumber = 'NO_CARD_NUMBER';
  @Input() paymentType: PaymentTypeEnum;
  @Input() checkoutId: number;

  private _subscription = new Subscription();
  protected instantDiscounts: InstantDiscountModel;
  protected instantDiscount: InstantDiscountInfo;

  constructor(
    protected _instantDiscountService: InstantDiscountService,
    private _toasterService: ToasterService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscribeToDiscounts();
    this.subscribeToDiscount();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  getInstantDiscounts(paymentType: PaymentTypeEnum): Observable<InstantDiscountModel> {
    return this._instantDiscountService.getInstantDiscounts(paymentType);
  }

  getAppliedInstantDiscount(paymentType: PaymentTypeEnum): Observable<InstantDiscountInfo> {
    return this._instantDiscountService.getAppliedInstantDiscount(paymentType);
  }

  getInstantDiscountByCardNumber(cardNumber: string): InstantDiscountInfo {
    return Object.values(this.instantDiscounts ?? {}).find(
      (instantDiscountInfo) => instantDiscountInfo.cardNumber === cardNumber
    );
  }

  isInstantDiscountsEmpty(): boolean {
    return this.instantDiscounts && Object.keys(this.instantDiscounts).length > 0;
  }

  isCardInstantDiscountEmpty(cardNumber: string): boolean {
    return !!this.getInstantDiscountByCardNumber(cardNumber);
  }

  isInstantDiscountApplied(): boolean {
    return !!this.instantDiscount;
  }

  onApplyInstantDiscount(discount: InstantDiscountInfo): void {
    this._instantDiscountService.use(
      { type: 'INSTANT_DISCOUNT', mainPaymentType: this.paymentType, value: discount.cardNumber },
      this.checkoutId
    );
    this.showToaster(discount.name);
  }

  onRemoveInstantDiscount(): void {
    this._instantDiscountService.cancel();
  }

  private subscribeToDiscounts(): void {
    this._subscription.add(
      this.getInstantDiscounts(this.paymentType).subscribe((data) => {
        this.instantDiscounts = data;
        this._cdr.markForCheck();
      })
    );
  }

  private subscribeToDiscount(): void {
    this._subscription.add(
      this.getAppliedInstantDiscount(this.paymentType).subscribe((data) => {
        this.instantDiscount = data;
        this._cdr.markForCheck();
      })
    );
  }

  private showToaster(discountMessage: string): void {
    this._toasterService.showToaster({
      settings: {
        state: 'success',
      },
      data: {
        title: 'Anında indirim işlemi',
        message: discountMessage,
      },
    });
  }
}
