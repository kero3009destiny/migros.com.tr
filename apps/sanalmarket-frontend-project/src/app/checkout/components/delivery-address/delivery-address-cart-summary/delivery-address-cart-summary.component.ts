import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { AgreementDialogComponent } from '@fe-commerce/core';

import { AcceptAgreementRequest, CartInfoDTO } from '@migroscomtr/sanalmarket-angular';
import AcceptedAgreementsEnum = AcceptAgreementRequest.AcceptedAgreementsEnum;

@Component({
  selector: 'sm-delivery-address-cart-summary',
  templateUrl: './delivery-address-cart-summary.component.html',
  styleUrls: ['./delivery-address-cart-summary.component.scss'],
})
export class DeliveryAddressCartSummaryComponent {
  @Input() cartInfo: CartInfoDTO;
  @Input() continueDisabled = false;

  @Output() continueTriggered: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  kvkkApproval = new FormControl();

  constructor(public agreementDialog: MatDialog) {}

  triggerContinue(event: MouseEvent) {
    this.continueTriggered.emit(event);
  }

  get isContinueDisabled() {
    return this.continueDisabled || !this.kvkkApproval.value;
  }

  onAgreementClick(agreementType: AcceptedAgreementsEnum) {
    const dialogRef = this.agreementDialog.open(AgreementDialogComponent, {
      panelClass: 'wide-dialog',
      data: { type: agreementType },
    });
  }
}
