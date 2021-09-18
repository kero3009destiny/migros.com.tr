import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CartProductNoteService } from '@fe-commerce/line-cart';
import { ToasterService } from '@fe-commerce/shared';

import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'sm-product-note-popover',
  templateUrl: './product-note-popover.component.html',
  styleUrls: ['./product-note-popover.component.scss'],
})
export class ProductNotePopoverComponent implements OnInit {
  @Input() initialNote = '';
  @Input() productId: number;
  @Input() productName: string;
  @Output() productNoteUpdated = new EventEmitter<void>();

  private note: string;

  productNoteFormGroup: FormGroup;
  private _isPopoverVisible = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _toasterService: ToasterService,
    private _cartProductNoteService: CartProductNoteService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.note = this.initialNote;
    this.productNoteFormGroup = this._formBuilder.group({
      productNote: [this.initialNote, [Validators.maxLength(500)]],
    });
  }

  isPopoverVisible(): boolean {
    return this._isPopoverVisible;
  }

  togglePopover(): void {
    this._isPopoverVisible = !this._isPopoverVisible;
    if (!this._isPopoverVisible)
      this.productNoteFormGroup.reset({
        productNote: this.initialNote,
      });
  }

  onSubmit(): void {
    const productNote = this.productNoteFormGroup.get('productNote').value;
    this._cartProductNoteService
      .upsertNote({ productId: this.productId, note: productNote })
      .pipe(
        map((response) => response.successful),
        filter((success) => !!success)
      )
      .subscribe(() => {
        this.productNoteUpdated.emit();
        this._showSuccessMessage();
        this._isPopoverVisible = false;
        this._cd.markForCheck();
      });
  }

  private _showSuccessMessage(): void {
    this._toasterService.showToaster({
      settings: {
        state: 'success',
      },
      data: {
        title: this.productName,
        message: 'Ürün Notu Güncellendi',
      },
    });
  }
}
