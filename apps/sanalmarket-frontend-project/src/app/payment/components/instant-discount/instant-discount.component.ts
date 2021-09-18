import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

import { InstantDiscountComponent, InstantDiscountService } from '@fe-commerce/campaign-instant-discount';
import { SidePaymentFacade } from '@fe-commerce/line-payment-side';
import { InstantDiscountInfo, ToasterService } from '@fe-commerce/shared';

import { filter } from 'rxjs/operators';

import { BkmTokenFormBean } from '@migroscomtr/sanalmarket-angular';
import PaymentTypeEnum = BkmTokenFormBean.PaymentTypeEnum;

enum InstantDiscountStates {
  DEFAULT = 'DEFAULT',
  USABLE = 'USABLE',
  USED = 'USED',
}

@Component({
  selector: 'sm-instant-discount',
  templateUrl: './instant-discount.component.html',
  styleUrls: ['./instant-discount.component.scss'],
})
export class SmInstantDiscountComponent extends InstantDiscountComponent implements OnInit, OnChanges, OnDestroy {
  private instantDiscountState = InstantDiscountStates.DEFAULT;

  private readonly CARD_AWARE_PAYMENT_TYPES: PaymentTypeEnum[] = [
    PaymentTypeEnum.Masterpass,
    PaymentTypeEnum.CreditCard,
  ];

  private readonly PAYMENT_TYPE_LABELS: Partial<Record<PaymentTypeEnum, string>> = {
    [PaymentTypeEnum.CreditCard]: 'Kredi Kartı',
    [PaymentTypeEnum.Masterpass]: 'Masterpass',
    [PaymentTypeEnum.Bkm]: 'Bkm Express',
    [PaymentTypeEnum.GarantiPay]: 'GarantiPay',
    [PaymentTypeEnum.CreditCardOnDelivery]: 'Kredi Kartı',
    [PaymentTypeEnum.CashOnDelivery]: 'Kapıda Nakit',
  };

  @Input() isSelected = false;

  constructor(
    private _sidePaymentService: SidePaymentFacade,
    _instantDiscountService: InstantDiscountService,
    _toasterService: ToasterService,
    _cdr: ChangeDetectorRef
  ) {
    super(_instantDiscountService, _toasterService, _cdr);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscribeToInstantDiscounts();
    this.fetchInstantDiscount();
  }

  private fetchInstantDiscount(): void {
    if (this.CARD_AWARE_PAYMENT_TYPES.includes(this.paymentType)) {
      return;
    }
    this._instantDiscountService.fetchInstantDiscounts(this.checkoutId, null, this.paymentType);
  }

  private subscribeToInstantDiscounts(): void {
    this.getInstantDiscounts(this.paymentType)
      .pipe(filter(() => this.isSelected))
      .subscribe(() => {
        this.instantDiscountState = InstantDiscountStates.USABLE;
      });
    this.getAppliedInstantDiscount(this.paymentType).subscribe((data) => {
      if (data === null) {
        if (this.isSelected) {
          this.instantDiscountState = InstantDiscountStates.USABLE;
        } else {
          this.instantDiscountState = InstantDiscountStates.DEFAULT;
        }
      } else {
        this.instantDiscountState = InstantDiscountStates.USED;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.instantDiscounts && Object.keys(this.instantDiscounts).length > 0 && changes.isSelected?.currentValue) {
      this.onRemoveInstantDiscount();
    } else {
      this.instantDiscountState = InstantDiscountStates.DEFAULT;
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  getLabel(): string {
    return this.PAYMENT_TYPE_LABELS[this.paymentType];
  }

  isInstantDiscountApplied(): boolean {
    return this.instantDiscountState === InstantDiscountStates.USED;
  }

  isInstantDiscountUsable(): boolean {
    return this.instantDiscountState === InstantDiscountStates.USABLE;
  }

  onApplyInstantDiscount(discount: InstantDiscountInfo): void {
    this._sidePaymentService.useSidePayment(
      { type: 'INSTANT_DISCOUNT', mainPaymentType: this.paymentType, value: discount?.id },
      this.checkoutId
    );
    this.instantDiscountState = InstantDiscountStates.USED;
  }

  onRemoveInstantDiscount(): void {
    this._sidePaymentService.cancelSidePayment();
    this.instantDiscountState = InstantDiscountStates.USABLE;
  }
}
