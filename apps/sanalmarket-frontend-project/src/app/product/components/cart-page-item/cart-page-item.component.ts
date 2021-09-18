import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { GtmService, LoadingIndicatorService, ProductService } from '@fe-commerce/core';
import { CartPageItemComponent, CartService } from '@fe-commerce/line-cart';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faEdit } from '@fortawesome/pro-regular-svg-icons/faEdit';
import { faTrashAlt } from '@fortawesome/pro-regular-svg-icons/faTrashAlt';
import { CartItemInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-cart-page-item',
  templateUrl: './cart-page-item.component.html',
  styleUrls: ['./cart-page-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SmCartPageItemComponent extends CartPageItemComponent {
  private _editIcon: IconProp = faEdit;
  private _trashIcon: IconProp = faTrashAlt;

  constructor(
    _cartService: CartService,
    _gtmService: GtmService,
    _productService: ProductService,
    productNoteDialog: MatDialog,
    _loadingIndicatorService: LoadingIndicatorService
  ) {
    super(_cartService, _gtmService, _productService, productNoteDialog, _loadingIndicatorService);
  }

  getNoteIcon(): IconProp {
    return this._editIcon;
  }

  getNote(cartItem: CartItemInfoDTO): string {
    return cartItem.item.note ?? '';
  }

  getTrashIcon(): IconProp {
    return this._trashIcon;
  }

  isProductNoteEmpty(cartItem): boolean {
    return !cartItem.item.note;
  }

  getIncrementAmount(cartItem: CartItemInfoDTO): number {
    const isSecondaryUnit = cartItem.item.unit !== cartItem.product.primaryUnit;
    return isSecondaryUnit ? cartItem.product.secondaryUnitIncrementAmount : cartItem.product.incrementAmount;
  }

  getInitialIncrementAmount(cartItem: CartItemInfoDTO): number {
    const isSecondaryUnit = cartItem.item.unit !== cartItem.product.primaryUnit;
    return isSecondaryUnit
      ? cartItem.product.secondaryUnitInitialIncrementAmount
      : cartItem.product.initialIncrementAmount;
  }

  onUpdateProductNote(): void {
    this._cartService.getCart(true);
  }
}
