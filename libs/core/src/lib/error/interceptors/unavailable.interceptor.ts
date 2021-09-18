/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { EnvService } from '@fe-commerce/env-service';
import { ShortfallDialogModel } from '@fe-commerce/shared';

import { tap } from 'rxjs/operators';

import { DialogConfigModel } from '../../models';
import {
  ShortfallDialogCloseCallback,
  ShortfallDialogService,
} from '../../services/shortfall-dialog/shortfall-dialog.service';
import { AppStateService, PortfolioEnum } from '../../services';

@Injectable()
export class UnavailableItemsInterceptor implements HttpInterceptor {
  constructor(
    private _shortfallDialogService: ShortfallDialogService,
    private _router: Router,
    private _envService: EnvService,
    private appStateService: AppStateService
  ) {}

  private readonly CONTINUE_TO_CART_TEXT = 'Sepetime Dön';
  private readonly CONTINUE_TO_CHECKOUT_TEXT = 'Siparişe Devam Et';

  private readonly CONTINUABLE_SHORTFALL_DIALOG_CONFIG: DialogConfigModel = {
    data: {
      confirmMessage: this.CONTINUE_TO_CHECKOUT_TEXT,
      cancelMessage: this.CONTINUE_TO_CART_TEXT,
      showCancelButton: true,
    },
    settings: { disableClose: true },
  };

  private readonly UNCONTINUABLE_SHORTFALL_DIALOG_CONFIG: DialogConfigModel = {
    data: {
      confirmMessage: this.CONTINUE_TO_CART_TEXT,
    },
    settings: {},
  };
  private readonly ROUTE_HOME: '';
  private readonly ROUTE_CART: 'sepetim';

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (
          event instanceof HttpResponse && // check if response exist
          event.status === 200 && // check if it is successful HTTP request
          event.body && // check if has body
          // event.body.successful === true && // check if is success from rest API
          event.body.data
        ) {
          const { unavailableItems, shortfallItems, priceLeftForCheckout } = event.body.data;
          const isShortfall = this.isObjectArrayHavingElement(shortfallItems);
          const isUnavailable = this.isObjectArrayHavingElement(unavailableItems);

          if (isShortfall) {
            this.openShortfallDialog({
              productList: shortfallItems,
              priceLeftForCheckout,
            });
          } else if (isUnavailable) {
            this.openUnavailableDialog({ productList: unavailableItems, priceLeftForCheckout });
          }
        }
      })
    );
  }

  isObjectArrayHavingElement(object: unknown): boolean {
    return Array.isArray(object) && object.length > 0;
  }

  openShortfallDialog(shortfallData: ShortfallDialogModel): void {
    this._shortfallDialogService.openShortfallDialog({
      shortfallData: shortfallData,
      dialogConfig: this.determineShortfallDialogConfig(shortfallData.priceLeftForCheckout),
      onClose: this.determineShortfallDialogCloseCallback(shortfallData),
    });
  }

  openUnavailableDialog(shortfallData: ShortfallDialogModel): void {
    this._shortfallDialogService.openShortfallDialog({
      shortfallData: shortfallData,
      onClose: this.navigateToEditCartPage.bind(this),
    });
  }

  determineShortfallDialogConfig(priceLeftForCheckout: number): DialogConfigModel {
    return this.isCheckoutContinuable(priceLeftForCheckout)
      ? this.CONTINUABLE_SHORTFALL_DIALOG_CONFIG
      : this.UNCONTINUABLE_SHORTFALL_DIALOG_CONFIG;
  }

  determineShortfallDialogCloseCallback(shortfallData: ShortfallDialogModel): ShortfallDialogCloseCallback {
    return this.isCheckoutContinuable(shortfallData.priceLeftForCheckout)
      ? this.onContinuableShortfallDialogClose.bind(this)
      : this.onUncontinuableShortfallDialogClose.bind(this);
  }

  isCheckoutContinuable(priceLeftForCheckout: number): boolean {
    return priceLeftForCheckout <= 0;
  }

  onContinuableShortfallDialogClose(_: ShortfallDialogModel, continueCheckout: boolean): void {
    if (!continueCheckout) {
      this.navigateToEditCartPage();
    }
  }

  onUncontinuableShortfallDialogClose(_s: ShortfallDialogModel, _c: boolean): void {
    this.navigateToEditCartPage();
  }

  navigateToEditCartPage(): void {
    this.appStateService.getPortfolio() === PortfolioEnum.KURBAN
      ? this._router.navigateByUrl(this.ROUTE_HOME)
      : this._router.navigateByUrl(this.ROUTE_CART);
  }
}
