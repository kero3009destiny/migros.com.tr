import { Injectable, Optional } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { MatDialog as DeprecatedMatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class CompositeDialogService {
  dialog: DeprecatedMatDialog | MatDialog;

  constructor(@Optional() private _deprecatedDialog?: DeprecatedMatDialog, @Optional() private _dialog?: MatDialog) {
    this.dialog = this._initializeDialog();
  }

  private _initializeDialog() {
    if (this._dialog) {
      return this._dialog;
    }
    if (this._deprecatedDialog) {
      return this._deprecatedDialog;
    }
    throw new Error('No material dialog provided!');
  }
}
