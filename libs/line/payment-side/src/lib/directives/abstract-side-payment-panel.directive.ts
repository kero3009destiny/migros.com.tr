import { Directive, EventEmitter, Input, Output } from '@angular/core';

import { SidePayment, SidePaymentDiscountInfo, SidePaymentInfo } from '@fe-commerce/line-payment';

@Directive()
export abstract class AbstractSidePaymentPanelDirective {
  readonly SIDE_PAYMENT_TYPE: SidePayment;
  readonly SIDE_PAYMENT_NAME: string;

  protected constructor(sidePaymentType: SidePayment, sidePaymentName: string) {
    this.SIDE_PAYMENT_TYPE = sidePaymentType;
    this.SIDE_PAYMENT_NAME = sidePaymentName;
  }

  @Input() usedSidePayment: SidePaymentDiscountInfo | null;
  @Input() step: SidePayment;

  @Output() opened = new EventEmitter<SidePayment>();
  @Output() closed = new EventEmitter<void>();

  @Output() used = new EventEmitter<SidePaymentInfo>();
  @Output() cancelled = new EventEmitter<SidePayment>();

  @Output() panelAvailable = new EventEmitter();

  getAmountUsed(): number | string {
    return this.isUsed() ? this.usedSidePayment.value : null;
  }

  isUsed(): boolean {
    return this.usedSidePayment?.type === this.SIDE_PAYMENT_TYPE;
  }

  onOpened(): void {
    this.opened.emit(this.SIDE_PAYMENT_TYPE);
  }

  onClosed(): void {
    this.closed.emit();
  }

  onClickUsed($event: string | number): void {
    this.used.emit({ type: this.SIDE_PAYMENT_TYPE, value: $event, name: this.SIDE_PAYMENT_NAME });
  }

  onClickCancelled(): void {
    this.cancelled.emit(this.SIDE_PAYMENT_TYPE);
  }
}
