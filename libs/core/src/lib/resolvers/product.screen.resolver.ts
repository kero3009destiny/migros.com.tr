import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { ProductScreenControllerService, ProductScreenDTO } from '@migroscomtr/sanalmarket-angular';

import { LoadingIndicatorService } from '../services';

@Injectable({ providedIn: 'root' })
export class ProductScreenResolver implements Resolve<ProductScreenDTO> {
  constructor(
    private _productScreenService: ProductScreenControllerService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductScreenDTO> {
    const id = (route.paramMap.get('id') as unknown) as number;
    this._loadingIndicatorService.start();
    return this._productScreenService.get5(id).pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data),
      map((screenInfo) => {
        if (screenInfo.shouldRedirectToElectronic) {
          window.location.href = `${location.origin}/elektronik/${screenInfo.storeProductInfoDTO.prettyName}`;
        }
        return screenInfo;
      }),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }
}
