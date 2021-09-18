import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { faTimes } from '@fortawesome/pro-light-svg-icons';

export interface ProductImagesDialogData {
  images: Array<any>;
  activeIndex: number;
}

@Component({
  selector: 'sm-product-images-dialog',
  templateUrl: './product-images-dialog.component.html',
  styleUrls: ['./product-images-dialog.component.scss'],
})
export class ProductImagesDialogComponent {
  closeIcon = faTimes;
  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: ProductImagesDialogData) {}
}
