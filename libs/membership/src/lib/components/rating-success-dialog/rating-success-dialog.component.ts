import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material-experimental/mdc-dialog';

import { faCheckCircle, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'fe-membership-rating-success-dialog',
  templateUrl: './rating-success-dialog.component.html',
  styleUrls: ['./rating-success-dialog.component.scss'],
})
export class RatingSuccessDialogComponent {
  successIcon: IconDefinition = faCheckCircle;

  constructor(public dialogRef: MatDialogRef<RatingSuccessDialogComponent>) {}

  dismissDialog(): void {
    this.dialogRef.close();
  }
}
