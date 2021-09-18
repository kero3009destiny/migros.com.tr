import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  AppResponseSearchAutoCompleteResultDTO,
  ProductSearchAutoCompleteRestControllerService,
  SanalmarketAggregationInfo,
  StoreProductInfoDTO,
} from '@migroscomtr/sanalmarket-angular';

import { LoggingService } from '../../error';
import { ProductService } from '../product/product.service';

@Injectable({
  providedIn: 'root',
})
export class SearchComboboxService {
  private _productResults$: BehaviorSubject<StoreProductInfoDTO[]> = new BehaviorSubject([]);
  private _categoryResults$: BehaviorSubject<SanalmarketAggregationInfo[]> = new BehaviorSubject([]);
  private _active$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private _autoCompleteRestService: ProductSearchAutoCompleteRestControllerService,
    private _httpClient: HttpClient,
    private _productService: ProductService,
    private _loggingService: LoggingService
  ) {}

  get productResults$() {
    return this._productResults$.asObservable();
  }

  get categoryResults$() {
    return this._categoryResults$.asObservable();
  }

  get active$() {
    return this._active$.asObservable();
  }

  open() {
    this._active$.next(true);
  }

  close() {
    this._active$.next(false);
  }

  setProducts(products: StoreProductInfoDTO[]) {
    this._productResults$.next(products);
  }

  setCategories(categories: SanalmarketAggregationInfo[]) {
    this._categoryResults$.next(categories);
  }

  getSearchResults(keyword: string): void {
    if (keyword && keyword.length > 1) {
      this._autoCompleteRestService
        .getProductSearchAutoCompleteResult(keyword)
        .pipe(
          catchError((error) => {
            this._loggingService.logError({ title: 'Hata', message: error });
            return EMPTY;
          }),
          map((response: AppResponseSearchAutoCompleteResultDTO) => response.data.searchInfo)
        )
        .subscribe((data) => {
          this.setProducts(data.storeProductInfos);
          this.setCategories(data.categoryAggregations);
        });
    } else {
      // Reset results
      this.setCategories([]);
      this.setProducts([]);
    }
  }
}
