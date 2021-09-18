import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdditionalOrderInfoModel } from '@fe-commerce/shared';
import { CheckoutDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-additonal-order',
  templateUrl: './additonal-order.component.html',
  styleUrls: ['./additonal-order.component.scss'],
})
export class AdditonalOrderComponent {
  @Input() additionalOrderStatus: AdditionalOrderInfoModel;
  @Input() checkout: CheckoutDTO | null = null;

  @Output() additionalOrderStarted = new EventEmitter<number>();

  @Output() additionalOrderExited = new EventEmitter<void>();

  isVisible(): boolean {
    return this.additionalOrderStatus?.isActive || this.isAddableOrderExist() || !!this.checkout?.derivedOrderId;
  }

  isAddableOrderExist(): boolean {
    return !this.additionalOrderStatus?.isActive && !!this.additionalOrderStatus?.lastAddableOrderId;
  }

  onClickStartAdditionalOrderButton(orderId: number): void {
    this.additionalOrderStarted.emit(orderId);
  }

  onClickCancelAdditionalOrderButton(): void {
    this.additionalOrderExited.emit();
  }
}
