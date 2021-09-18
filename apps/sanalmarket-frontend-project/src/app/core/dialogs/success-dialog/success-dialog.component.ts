import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';
import { faTimes, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

interface SuccessDialogModel {
  message: string;
}

@Component({
  selector: 'sm-success-dialog',
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.scss'],
})
export class SuccessDialogComponent implements OnInit {
  successMessage: string;
  closeIcon: IconDefinition = faTimes;
  successIcon: IconDefinition = faCheckCircle;

  constructor(
    public dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData: SuccessDialogModel
  ) {}

  ngOnInit(): void {
    this.successMessage = this.dialogData.message;
  }

  dismissDialog(): void {
    this.dialogRef.close();
  }
}
