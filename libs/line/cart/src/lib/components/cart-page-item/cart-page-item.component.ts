import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { GtmService, LoadingIndicatorService, ProductService } from '@fe-commerce/core';
import { MaxAmountInfoModel, ProductActionsComponent } from '@fe-commerce/shared';

import { CartItemInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { CartService } from '../../services';
import { ProductNoteDialogComponent } from '../product-note/product-note.dialog.component';
@Component({
  selector: 'fe-line-cart-page-item',
  templateUrl: './cart-page-item.component.html',
  styleUrls: ['./cart-page-item.component.scss'],
})
export class CartPageItemComponent implements OnInit {
  @Input() cartItem: CartItemInfoDTO;
  @ViewChild('action') productCardActionRef?: ProductActionsComponent;

  constructor(
    protected _cartService: CartService,
    private _gtmService: GtmService,
    private _productService: ProductService,
    public productNoteDialog: MatDialog,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  ngOnInit() {
    this.subscribeToCartError();
  }

  get brand(): { name: string; id: number } {
    const id = this.cartItem.product.brandId;
    const name = this.cartItem.product.brandName;
    return { id, name };
  }

  get reminderVisibility(): boolean {
    return this._productService.reminderVisibility;
  }

  private subscribeToCartError(): void {
    this._cartService.cartError$.subscribe((cartError) => {
      if (cartError.productId) {
        this.handleCartError(cartError);
      }
    });
  }

  private handleCartError({ productId }): void {
    if (this.cartItem.item.productId === productId) {
      this.productCardActionRef?.rollback();
    }
  }

  onUpdate(amount: number): void {
    const {
      item: { productId, unit },
      product,
    } = this.cartItem;
    this._cartService.update({ productId, amount, unit }, product, this.cartItem.referrerEventId, true);
  }

  onMaxAmountReached(maxAmountInfo: MaxAmountInfoModel): void {
    this._cartService.maxAmountError(maxAmountInfo);
  }

  deleteItem(): void {
    const {
      item: { productId, unit },
      product,
    } = this.cartItem;
    this._cartService.update({ productId, amount: 0, unit }, product, this.cartItem.referrerEventId, true);
  }

  sendGtmClickEvent(cartItem: CartItemInfoDTO): void {
    const product = { ...cartItem.product, id: cartItem.item.productId };
    const list = 'Cart Page';
    this._gtmService.sendProductClickEvent({ product, list });
  }

  openProductNoteDialog(productId: number, productName: string, initialNote: string): void {
    const ref = this.productNoteDialog.open(ProductNoteDialogComponent, {
      data: { productId, productName, initialNote },
    });
    ref.componentInstance.productNoteUpdated.subscribe(() => {
      this._cartService.getCart();
    });
  }
}
