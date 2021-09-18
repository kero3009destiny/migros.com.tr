import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { DialogCloseReasonModel } from '../../models/DialogModel';

@Component({
  selector: 'fe-confirmation-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  closeDialog(result: DialogCloseReasonModel) {
    this.dialogRef.close(result);
  }

  get confirmButtonClass() {
    return this.data.state === 'danger'
      ? 'button button-hollow'
      : 'button button-primary modal__btn modal__btn--confirm';
  }
}
