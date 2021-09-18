import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { AgreementDialogComponent } from '@fe-commerce/core';
import { AgreementsType } from '@fe-commerce/shared';

import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-contact-preferences-form',
  templateUrl: './contact-preferences-form.component.html',
  styleUrls: ['./contact-preferences-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ContactPreferencesFormComponent {
  checkIcon = faCheckCircle;

  @Input() isCrmVerified: boolean;
  @Input() formGroup: FormGroup;

  constructor(public agreementDialog: MatDialog) {}

  onAgreementClick(agreementType: AgreementsType): void {
    this.agreementDialog.open(AgreementDialogComponent, {
      data: { type: agreementType },
    });
  }
}
