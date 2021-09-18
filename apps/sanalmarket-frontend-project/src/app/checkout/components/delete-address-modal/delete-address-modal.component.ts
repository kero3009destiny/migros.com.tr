import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material-experimental/mdc-dialog';

import { faTimes } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-delete-address-modal',
  templateUrl: './delete-address-modal.component.html',
  styleUrls: ['./delete-address-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeleteAddressModalComponent {
  @Output() accept: EventEmitter<boolean> = new EventEmitter();

  closeIcon = faTimes;

  constructor(public dialogRef: MatDialogRef<DeleteAddressModalComponent>) {}

  onClickAccept(): void {
    this.accept.emit(true);
    this.dialogRef.close();
  }

  onClickClose(): void {
    this.accept.emit(false);
    this.dialogRef.close();
  }
}
