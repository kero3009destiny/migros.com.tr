import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';

import { AbstractSidePaymentPanelDirective } from '@fe-commerce/line-payment-side';

import { EnhancedBalanceInfoForCrm } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-side-payment-panel-money',
  templateUrl: './side-payment-panel-money.component.html',
  styleUrls: ['./side-payment-panel-money.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidePaymentPanelMoneyComponent extends AbstractSidePaymentPanelDirective implements OnChanges {
  extraValidators: ValidatorFn[];

  @Input() balance: EnhancedBalanceInfoForCrm;

  constructor() {
    super('MONEY_POINT', 'MONEY_POINT');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.balance) {
      const { currentValue, previousValue } = changes.balance;
      if (currentValue && previousValue !== currentValue) {
        const current = currentValue as EnhancedBalanceInfoForCrm;
        this.extraValidators = [Validators.min(current.minUsableAmount), Validators.max(current.maxUsableAmount)];
      }
    }
  }

  isAvailable(): boolean {
    return this.balance?.balanceInfo.value >= this.balance?.minUsableAmount;
  }

  onFormSubmitted($event: string | number): void {
    if (this.usedSidePayment?.type === this.SIDE_PAYMENT_TYPE) {
      this.onClickCancelled();
    } else {
      this.onClickUsed($event);
    }
  }
}
