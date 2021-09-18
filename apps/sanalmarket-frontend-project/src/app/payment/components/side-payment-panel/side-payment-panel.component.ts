import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { SidePayment, SidePaymentDiscountInfo } from '@fe-commerce/line-payment';

import { faMinus, faPlus } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-side-payment-panel',
  templateUrl: './side-payment-panel.component.html',
  styleUrls: ['./side-payment-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidePaymentPanelComponent {
  @Input() sidePayment: SidePayment;
  @Input() usedSidePayment: SidePaymentDiscountInfo;
  @Input() step: SidePayment;

  @Output() opened = new EventEmitter<SidePayment>();
  @Output() closed = new EventEmitter<void>();

  plusIcon = faPlus;
  minusIcon = faMinus;

  isExpanded(): boolean {
    return this.isSelected();
  }

  private isSelected(): boolean {
    return this.step === this.sidePayment;
  }

  onOpened(): void {
    this.opened.emit(this.sidePayment);
  }

  onClosed(): void {
    this.closed.emit();
  }
}
