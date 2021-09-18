import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';

import { AbstractSidePaymentPanelDirective } from '@fe-commerce/line-payment-side';

import { faUserTag } from '@fortawesome/pro-regular-svg-icons';
import { EnhancedBalanceInfoForCrm } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-side-payment-panel-personal-bond',
  templateUrl: './side-payment-panel-personal-bond.component.html',
  styleUrls: ['./side-payment-panel-personal-bond.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidePaymentPanelPersonalBondComponent extends AbstractSidePaymentPanelDirective implements OnChanges {
  readonly PERSONAL_BOND_ICON = faUserTag;

  extraValidators: ValidatorFn[];

  @Input() balance: EnhancedBalanceInfoForCrm;

  constructor() {
    super('PERSONNEL_BOND', 'PERSONNEL_BOND');
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
