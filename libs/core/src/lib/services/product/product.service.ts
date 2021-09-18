import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { EnvService } from '@fe-commerce/env-service';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, filter, finalize, map, takeUntil, tap } from 'rxjs/operators';

import { BehaviorSubject, EMPTY, Observable, Subscription, throwError } from 'rxjs';
import {
  FavouriteProductRestControllerService,
  ProductRestControllerService,
  ServiceResponse,
  StoreProductInfoDTO,
} from '@migroscomtr/sanalmarket-angular';

import { LoggingService } from '../../error';
import { LoadingIndicatorService } from '../loading-indicator/loading-indicator.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends SubscriptionAbstract {
  private _favouriteProductIds = new BehaviorSubject<number[]>([]);

  private _isAuthenticated: boolean;
  private _reminderVisibility = false;

  constructor(
    private _productRestService: ProductRestControllerService,
    private _favouriteProductsRestService: FavouriteProductRestControllerService,
    private _loggingService: LoggingService,
    private _userService: UserService,
    private _router: Router,
    private _envService: EnvService,
    private _httpClient: HttpClient,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {
    super();
    this.subscribeToUserAuthState();
    this.setReminderState();
  }

  get(id: number): Observable<StoreProductInfoDTO> {
    this._loadingIndicatorService.start();
    return this._productRestService.getStoreProductInfo(id).pipe(
      takeUntil(this.getDestroyInterceptor()),
      finalize(() => {
        this._loadingIndicatorService.stop();
      }),
      map((response) => response.data)
    );
  }

  get reminderVisibility(): boolean {
    return this._reminderVisibility;
  }

  getFavouriteProductIds(): Observable<number[]> {
    return this._favouriteProductIds.asObservable();
  }

  getFavoriteProducts(pageIndex: number): Observable<Array<StoreProductInfoDTO>> {
    this._loadingIndicatorService.start();
    return this._favouriteProductsRestService.getFavouriteProducts(null, null, null, null, null, null, pageIndex).pipe(
      takeUntil(this.getDestroyInterceptor()),
      finalize(() => {
        this._loadingIndicatorService.stop();
      }),
      map((data) => data.data.storeProductInfos)
    );
  }

  subscribeToUserAuthState(): void {
    this._userService.isAuthenticated$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((isAuthenticated) => {
      this._isAuthenticated = isAuthenticated;
    });
    this._userService.isAuthenticated$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((isAuthenticated) => !!isAuthenticated)
      )
      .subscribe(() => {
        this._getFavouriteProductIds();
      });
  }

  remindWhenProductInSale(id: number): Observable<unknown> {
    if (!this._isAuthenticated) {
      this._router.navigate(['/giris']);
      return EMPTY;
    } else {
      return this._productRestService.remindProduct(id).pipe(takeUntil(this.getDestroyInterceptor()));
    }
  }

  addFavouriteProduct(productId: number): Observable<ServiceResponse> {
    return this._favouriteProductsRestService.addFavouriteProduct(productId).pipe(
      takeUntil(this.getDestroyInterceptor()),
      catchError((error) => throwError(error)),
      tap(() => {
        this._loggingService.logSuccess({ title: 'Favori Ürünlerim', message: 'Ürün favorilerinize eklendi' });
      }),
      tap(() => {
        if (!this._favouriteProductIds.value.includes(productId)) {
          this._favouriteProductIds.next([...this._favouriteProductIds.value, productId]);
        }
      })
    );
  }

  removeFavouriteProduct(productId: number): Observable<ServiceResponse> {
    return this._favouriteProductsRestService.removeFavouriteProduct(productId).pipe(
      takeUntil(this.getDestroyInterceptor()),
      catchError((error) => throwError(error)),
      tap(() => {
        this._loggingService.logInfo({ title: 'Favori Ürünlerim', message: 'Ürün favorilerinizden çıkarıldı' });
      }),
      tap(() => {
        if (this._favouriteProductIds.value.includes(productId)) {
          this._favouriteProductIds.next(this._favouriteProductIds.value.filter((id) => id !== productId));
        }
      })
    );
  }

  private setReminderState(): void {
    this._reminderVisibility = this._envService.productReminderSupported;
  }

  // TODO: Use ProductRestControllerService when search is usable
  search(params): Observable<Record<string, unknown>> {
    const url = `${this._envService.baseUrl}/products/search`;
    // @ts-expect-error  Don't use `object` as a type. The `object` type is currently hard to use ([see this issue](https://github.com/microsoft/TypeScript/issues/21732)).
    // Consider using `Record<string, unknown>` instead, as it allows you to more easily inspect and use the keys  @typescript-eslint/ban-types
    return this._httpClient
      .get(url, {
        params: params,
      })
      .pipe(takeUntil(this.getDestroyInterceptor()));
  }

  private _getFavouriteProductIds(): Subscription {
    return this._favouriteProductsRestService
      .getFavouriteProductIds()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError(() => EMPTY),
        map((response) => response.data)
      )
      .subscribe((ids) => {
        this._favouriteProductIds.next(ids);
      });
  }
}
