import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material-experimental/mdc-dialog';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { faTimes } from '@fortawesome/pro-light-svg-icons';

@Component({
  selector: 'fe-track-order-modal',
  templateUrl: './anonymous-track-order-modal.component.html',
  styleUrls: ['./anonymous-track-order-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AnonymousTrackOrderModalComponent implements OnInit {
  trackOrderFormGroup: FormGroup;
  closeIcon = faTimes;

  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AnonymousTrackOrderModalComponent>
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  getPhoneNumber(): AbstractControl {
    return this.trackOrderFormGroup.get('phoneNumber');
  }

  getOrderId(): AbstractControl {
    return this.trackOrderFormGroup.get('orderId');
  }

  onClickClose(): void {
    this.dialog.closeAll();
  }

  buildForm(): void {
    this.trackOrderFormGroup = this._formBuilder.group({
      phoneNumber: [null, [Validators.required, Validators.pattern(/^5{1}[0-9]{9}$/)]],
      orderId: [null, [Validators.required, Validators.pattern('[0-9]{8}|[0-9]{9}')]],
    });
  }

  onClickTrack(id, phoneNumber): void {
    this.dialogRef.close({ id: id.value, phoneNumber: phoneNumber.value });
  }
}
