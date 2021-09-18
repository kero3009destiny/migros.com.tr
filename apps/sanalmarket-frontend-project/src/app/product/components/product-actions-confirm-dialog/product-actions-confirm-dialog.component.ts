import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { faExclamationCircle } from '@fortawesome/pro-regular-svg-icons/faExclamationCircle';

export interface ProductActionsData {
  content: string;
}

@Component({
  selector: 'sm-product-actions-confirm-dialog',
  templateUrl: './product-actions-confirm-dialog.component.html',
  styleUrls: ['./product-actions-confirm-dialog.component.scss'],
})
export class ProductActionsConfirmDialogComponent {
  private _faTimes = faTimes;
  private _exclamationIcon = faExclamationCircle;

  constructor(@Inject(MAT_DIALOG_DATA) private _data: ProductActionsData) {}

  getContent(): string {
    return this._data.content;
  }

  getTimesIcon(): IconProp {
    return this._faTimes;
  }

  getExclamationIcon(): IconProp {
    return this._exclamationIcon;
  }
}
