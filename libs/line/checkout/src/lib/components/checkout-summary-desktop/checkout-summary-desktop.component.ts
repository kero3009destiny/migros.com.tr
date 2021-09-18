import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CheckoutInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'fe-line-checkout-summary-desktop',
  templateUrl: './checkout-summary-desktop.component.html',
  styleUrls: ['./checkout-summary-desktop.component.scss'],
})
export class CheckoutSummaryDesktopComponent {
  @Input() checkoutInfo: CheckoutInfoDTO;
  @Input() isContinueButtonDisabled = false;
  @Output() continueClicked = new EventEmitter();
  @Input() isCartPage = false;

  onDesktopClickContinue(): void {
    this.continueClicked.emit();
  }
}
