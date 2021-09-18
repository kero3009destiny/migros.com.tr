import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { GtmService, LoadingIndicatorService, LoggingService } from '@fe-commerce/core';
import { AddressService } from '@fe-commerce/delivery';
import { OrderService } from '@fe-commerce/membership';

import { takeUntil } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';
import { OrderInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { UserAddressessPageComponent } from '../../pages';

class OrderAddressDialogData {
  isAddressChangeDialog: boolean;
  orderId: number;
}

@Component({
  selector: 'sm-order-address-dialog',
  templateUrl: './order-address-dialog.component.html',
  styleUrls: ['./order-address-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderAddressDialogComponent extends UserAddressessPageComponent {
  private _isSuccessMessageVisible = false;

  @Output() addressChanged = new EventEmitter<OrderInfoDTO>();

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: OrderAddressDialogData,
    private _orderService: OrderService,
    loggingService: LoggingService,
    dialog: MatDialog,
    cdr: ChangeDetectorRef,
    addressService: AddressService,
    loadingIndicatorService: LoadingIndicatorService,
    gtmService: GtmService,
    router: Router
  ) {
    super(loggingService, dialog, cdr, addressService, loadingIndicatorService, gtmService, router);
  }
  getCheckIcon(): IconProp {
    return faCheckCircle;
  }

  getCloseIcon(): IconProp {
    return faTimes;
  }

  getTitle(): string {
    return `${this.dialogData.isAddressChangeDialog ? 'Teslimat' : 'Fatura'} Adresini Güncelle`;
  }

  isSuccessMessageVisible(): boolean {
    return this._isSuccessMessageVisible;
  }

  changeInvoiceAddress(addressId: number): void {
    this._isSuccessMessageVisible = false;
    this.cdr.markForCheck();

    this._orderService
      .changeInvoiceAddress(this.dialogData.orderId, addressId)
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((orderInfo: OrderInfoDTO) => {
        this._isSuccessMessageVisible = true;
        this.cdr.markForCheck();
        this.addressChanged.emit(orderInfo);
      });
  }
}
