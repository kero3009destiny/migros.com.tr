import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material-experimental/mdc-dialog';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';

import { CompleteMembershipEvent, CompleteMembershipRef } from '../complete-membership.ref';

@Component({
  templateUrl: './mobile-agreements-dialog.component.html',
  styleUrls: ['./mobile-agreements-dialog.component.scss'],
})
export class MobileAgreementsDialogComponent extends CompleteMembershipRef implements OnInit {
  closeIcon: IconProp = faTimes;

  completeMembershipFormGroup: FormGroup;

  constructor(formBuilder: FormBuilder, public dialogRef: MatDialogRef<MobileAgreementsDialogComponent>) {
    super(formBuilder);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  onClickDialogCompleteMembershipButton() {
    this.onClickCompleteMembershipButton();
    if (!this.isCompleteMembershipDisabled()) {
      this.dialogRef.close(this.createCompleteMembershipEvent());
    }
  }
}
