import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { CheckoutInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'fe-line-checkout-summary',
  templateUrl: './checkout-summary.component.html',
  styleUrls: ['./checkout-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutSummaryComponent {
  @Input() checkoutInfo: CheckoutInfoDTO;
  @Input() isCartPage = false;
  @Input() isContinueButtonDisabled = false;
  @Output() continueClicked = new EventEmitter();

  getCheckoutInfo(): CheckoutInfoDTO {
    return this.checkoutInfo;
  }

  onClickContinue(): void {
    this.continueClicked.emit();
  }
}
