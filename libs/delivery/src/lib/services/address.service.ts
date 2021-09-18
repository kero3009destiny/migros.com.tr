import { Injectable } from '@angular/core';

import { LoadingIndicatorService, LoggingService } from '@fe-commerce/core';
import { AddressOwnerModel } from '@fe-commerce/shared';

import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, map } from 'rxjs/operators';

import {
  AddCorporateInvoiceAddressFormBean,
  AddDeliveryAddressFormBean,
  AddPersonalInvoiceAddressFormBean,
  AddressInfo,
  AddressInfoBean,
  AddressRestControllerService,
  UpdateCorporateInvoiceAddressFormBean,
  UpdateDeliveryAddressFormBean,
  UpdatePersonalInvoiceAddressFormBean,
} from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  constructor(
    private _addressRestService: AddressRestControllerService,
    private _loggingService: LoggingService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  getDeliveryAddresses(checkoutId?: number): Observable<AddressInfoBean[]> {
    this._loadingIndicatorService.start();
    return (
      this._addressRestService
        // This api is actually not deprecated
        // But has this tag for some backend reason
        .getDeliveryAddresses(checkoutId)
        .pipe(
          catchError((error) => {
            this._loggingService.logError({ title: 'Hata', message: error });
            return EMPTY;
          }),
          map((response) => response.data),
          filter((data) => !!data),
          finalize(() => {
            this._loadingIndicatorService.stop();
          })
        )
    );
  }

  getInvoiceAddresses(): Observable<AddressInfoBean[]> {
    this._loadingIndicatorService.start();
    return this._addressRestService.getInvoiceAddresses().pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  createDeliveryAddress(formBean: AddDeliveryAddressFormBean): Observable<AddressInfoBean> {
    formBean.billTo = formBean.billTo || false;
    formBean.shipTo = true;
    return this._addressRestService.addDeliveryAddress(formBean).pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  createInvoiceAddress(
    formBean: AddPersonalInvoiceAddressFormBean | AddCorporateInvoiceAddressFormBean,
    owner: AddressOwnerModel
  ) {
    switch (owner) {
      case AddressOwnerModel.PERSONAL:
        return this.createPersonalInvoiceAddress(formBean);
      case AddressOwnerModel.CORPORATE:
        return this.createCorporateInvoiceAddress(formBean);
      default:
        throw new Error(`Unknown owner type: ${owner}`);
    }
  }

  createPersonalInvoiceAddress(formBean: AddPersonalInvoiceAddressFormBean): Observable<AddressInfo> {
    formBean.billTo = true;
    formBean.shipTo = false;
    return this._addressRestService.addPersonalInvoiceAddress(formBean).pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  createCorporateInvoiceAddress(formBean: AddCorporateInvoiceAddressFormBean): Observable<AddressInfo> {
    formBean.billTo = true;
    formBean.shipTo = false;
    return this._addressRestService.addCorporateInvoiceAddress(formBean).pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  updateDeliveryAddress(formBean: UpdateDeliveryAddressFormBean): Observable<AddressInfoBean> {
    return this._addressRestService.updateDeliveryAddress(formBean).pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  updateInvoiceAddress(
    formBean: UpdatePersonalInvoiceAddressFormBean | UpdateCorporateInvoiceAddressFormBean,
    owner: AddressOwnerModel
  ) {
    switch (owner) {
      case AddressOwnerModel.PERSONAL:
        return this.updatePersonalInvoiceAddress(formBean);
      case AddressOwnerModel.CORPORATE:
        return this.updateCorporateInvoiceAddress(formBean);
      default:
        throw new Error(`Unknown owner type: ${owner}`);
    }
  }

  updatePersonalInvoiceAddress(formBean: UpdatePersonalInvoiceAddressFormBean): Observable<AddressInfo> {
    return this._addressRestService.updatePersonalInvoiceAddress(formBean).pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  updateCorporateInvoiceAddress(formBean: UpdateCorporateInvoiceAddressFormBean): Observable<AddressInfo> {
    return this._addressRestService.updateCorporateInvoiceAddress(formBean).pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  removeAddress(addressId: number, isInvoice: boolean): Observable<any> {
    this._loadingIndicatorService.start();
    return this._addressRestService._delete(addressId, isInvoice).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }
}
