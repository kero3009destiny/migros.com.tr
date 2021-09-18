import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Validators } from '@angular/forms';

import { AbstractSidePaymentPanelDirective } from '@fe-commerce/line-payment-side';

import { faGiftCard } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-side-payment-panel-voucher',
  templateUrl: './side-payment-panel-voucher.component.html',
  styleUrls: ['./side-payment-panel-voucher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SidePaymentPanelVoucherComponent extends AbstractSidePaymentPanelDirective {
  readonly VOUCHER_ICON = faGiftCard;
  readonly EXTRA_VALIDATORS = [Validators.minLength(16), Validators.maxLength(16)];

  constructor() {
    super('VOUCHER', 'VOUCHER');
  }

  onFormSubmitted($event: string | number): void {
    if (this.usedSidePayment?.type === this.SIDE_PAYMENT_TYPE) {
      this.onClickCancelled();
    } else {
      this.onClickUsed($event);
    }
  }
}
