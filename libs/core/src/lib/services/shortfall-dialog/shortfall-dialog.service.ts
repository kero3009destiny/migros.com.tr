import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { ShortfallDialogModel } from '@fe-commerce/shared';

import { ShortfallProductListComponent } from '../../components';
import { SHORTFALL_DATA } from '../../injectors';
import { DialogConfigModel } from '../../models';
import { DialogService } from '../dialog/dialog.service';

export type ShortfallDialogCloseCallback = (shortfallData: ShortfallDialogModel, continueCheckout: boolean) => void;

interface OpenShortfallDialogParams {
  shortfallData: ShortfallDialogModel;
  onClose?: ShortfallDialogCloseCallback;
  dialogConfig?: DialogConfigModel;
}

@Injectable({
  providedIn: 'root',
})
export class ShortfallDialogService {
  constructor(private _dialogService: DialogService, private _injector: Injector, private _router: Router) {}

  openShortfallDialog({ shortfallData, onClose, dialogConfig }: OpenShortfallDialogParams) {
    this._dialogService.dialogRef && this._dialogService.dialogRef.close();
    const portal = this.createShortfallPortal(shortfallData);
    this._dialogService.openDialog({
      settings: { autoFocus: false, ...dialogConfig?.settings },
      data: {
        title: 'Sepetiniz Güncellendi',
        message: 'Sepetinizdeki bazı ürünlerin stokları azaldığı veya tükendiği için sepetinizi güncelledik.',
        portal,
        state: 'success',
        icon: 'danger',
        confirmMessage: 'Devam Et',
        showCancelButton: false,
        onDialogClose: ({ confirmed }) => {
          /**
           *  If continue is not possible, shortfall flow
           *  will eventually make user navigate to cart page.
           *  This is for a special case:
           *  If user tries to add an item from special discounts section.
           *  We get cartItemInfos from update request as response whenever a product is added or deleted
           *  We also need to reload campaigns on shortfall
           */
          if (this._router.url === '/sepetim') {
            window.location.reload();
          }
          // error is scoped
          if (onClose) {
            onClose(shortfallData, confirmed);
          }
        },
        ...dialogConfig?.data,
      },
    });
  }

  createShortfallPortal(shortfallData: ShortfallDialogModel) {
    const injector = this.generateFallBackDataToken(shortfallData);
    return new ComponentPortal(ShortfallProductListComponent, null, injector);
  }

  generateFallBackDataToken({ productList, priceLeftForCheckout = 0 }) {
    const injectorTokens = new WeakMap<any, any>([[SHORTFALL_DATA, { productList, priceLeftForCheckout }]]);

    return new PortalInjector(this._injector, injectorTokens);
  }
}
