import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { ToasterService } from '@fe-commerce/shared';

import { filter, map } from 'rxjs/operators';

import { CartProductNoteService } from './internal';

interface DialogData {
  productId: number;
  productName: string;
  initialNote: string;
}

@Component({
  selector: 'fe-line-cart-product-note-dialog',
  templateUrl: './product-note.dialog.component.html',
  styleUrls: ['./product-note.dialog.component.scss'],
  providers: [CartProductNoteService],
})
export class ProductNoteDialogComponent implements OnInit {
  productNoteFormGroup: FormGroup;

  @Output() productNoteUpdated = new EventEmitter();

  constructor(
    private _dialogRef: MatDialogRef<ProductNoteDialogComponent>,
    private _formBuilder: FormBuilder,
    private _productNoteService: CartProductNoteService,
    private _toasterService: ToasterService,
    @Inject(MAT_DIALOG_DATA) private _data: DialogData
  ) {}

  ngOnInit() {
    this.productNoteFormGroup = this._formBuilder.group({
      productNote: [this._data.initialNote, [Validators.maxLength(500)]],
    });
  }

  onSubmit() {
    this.productNoteFormGroup.markAllAsTouched();
    if (this.productNoteFormGroup.valid) {
      const productNote = this.productNoteFormGroup.get('productNote').value;
      this._productNoteService
        .upsertNote({ productId: this._data.productId, note: productNote })
        .pipe(
          map((response) => response.successful),
          filter((success) => !!success)
        )
        .subscribe(() => {
          this.productNoteUpdated.emit();
          this._showSuccessMessage();
          this._dialogRef.close();
        });
    }
  }

  private _showSuccessMessage = () => {
    this._toasterService.showToaster({
      settings: {
        state: 'success',
      },
      data: {
        title: this._data.productName,
        message: 'Ürün Notu Güncellendi',
      },
    });
  };

  onDismissClick() {
    this._dialogRef.close();
  }
}
