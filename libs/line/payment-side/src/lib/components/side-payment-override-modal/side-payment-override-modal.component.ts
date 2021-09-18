import { Component, EventEmitter, Output } from '@angular/core';

import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'fe-side-payment-override-modal',
  templateUrl: './side-payment-override-modal.component.html',
  styleUrls: ['./side-payment-override-modal.component.scss'],
})
export class SidePaymentOverrideModalComponent {
  infoIcon = faInfoCircle;

  @Output() overrideAccepted = new EventEmitter<void>();
  @Output() overrideDenied = new EventEmitter<void>();

  onClickAccepted(): void {
    this.overrideAccepted.emit();
  }

  onClickDenied(): void {
    this.overrideDenied.emit();
  }
}
