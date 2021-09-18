import { Inject, Injectable, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';
import {
  MatDialogRef as DeprecatedMatDialogRef,
  MAT_DIALOG_DATA as DEPRECATED_MAT_DIALOG_DATA,
} from '@angular/material/dialog';

/**
 * To be able to use generics for injected beans, one has to use the annotation below
 * For more info see: https://github.com/angular/angular/issues/20351#issuecomment-344009887
 */
/** @dynamic */
@Injectable()
export class CompositeDialogRefService<T, R> {
  dialogRef: DeprecatedMatDialogRef<T, any> | MatDialogRef<T>;
  data: R;

  constructor(
    @Optional() private _deprecatedDialogRef?: DeprecatedMatDialogRef<T>,
    @Optional() private _dialogRef?: MatDialogRef<T>,
    //
    @Optional() @Inject(DEPRECATED_MAT_DIALOG_DATA) private _deprecatedData?: R,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data?: R
  ) {
    this.dialogRef = this._initializeDialogRef();
    this.data = this._initializeDialogData();
  }

  private _initializeDialogRef() {
    if (this._dialogRef) {
      return this._dialogRef;
    }
    if (this._deprecatedDialogRef) {
      return this._deprecatedDialogRef;
    }
    throw new Error('No material dialog ref provided!');
  }

  private _initializeDialogData() {
    if (this._data) {
      return this._data;
    }
    if (this._deprecatedData) {
      return this._deprecatedData;
    }
    throw new Error('No material dialog data provided!');
  }
}
