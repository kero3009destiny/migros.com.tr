import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { UserService } from '@fe-commerce/core';
import { ProductActionsComponent } from '@fe-commerce/shared';

import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faMinus, faPlus, faTrashAlt } from '@fortawesome/pro-regular-svg-icons';

import { DeliveryOptionsModalComponent } from '../../../delivery';

@Component({
  selector: 'sm-product-actions',
  templateUrl: './product-actions.component.html',
  styleUrls: ['./product-actions.component.scss'],
})
export class SmProductActionsComponent extends ProductActionsComponent implements OnInit {
  @Input() disabled = false;
  @Input() iconButton = true;
  @Input() hasAlternativeUnit = false;

  faTrash = faTrashAlt;
  faMinus = faMinus;
  faPlus = faPlus;
  private _hasDistrictId: boolean;

  constructor(private _userService: UserService, private _matDialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._userService.hasDistrictId$
      .pipe(takeUntil(this.getDestroyInterceptor()), distinctUntilChanged())
      .subscribe((hasDistrictId) => {
        this._hasDistrictId = hasDistrictId;
      });
  }

  isTrashIconVisible(): boolean {
    return this.localAmount === 1;
  }

  getTrashIcon(): IconProp {
    return this.faTrash;
  }

  getMinusIcon(): IconProp {
    return this.faMinus;
  }

  getPlusIcon(): IconProp {
    return this.faPlus;
  }

  getUnitLabel(): string {
    return this.unit === 'PIECE' || this.unit === 'PACKET' ? 'adet' : 'kg';
  }

  getAddToCartButtonLabel(): string {
    if (!this.hasAlternativeUnit) {
      return 'Sepete Ekle';
    }
    return this.unit === 'PIECE' || this.unit === 'PACKET' ? 'Adet ile Sepete Ekle' : 'Kg ile Sepete Ekle';
  }

  emitUpdatedValue(localAmount): void {
    if (!this._hasDistrictId) {
      this._matDialog.open(DeliveryOptionsModalComponent, {
        panelClass: ['delivery-options-modal__container', 'mobile-modal'],
        id: 'modal-component',
        data: {
          title: 'Teslimat Yöntemini Belirle',
        },
      });
      return;
    }
    super.emitUpdatedValue(localAmount);
  }
}
