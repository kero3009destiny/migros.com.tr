import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';

import { LoadingIndicatorService, LoggingService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';

import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import {
  AppResponseSearchScreenResultDTO,
  ProductSearchInfoWithMetaData,
  SearchScreenResultDTO,
  ServiceResponseProductSearchInfoWithMetaData,
} from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class ProductSearchService {
  constructor(
    private _envService: EnvService,
    private _httpClient: HttpClient,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _loggingService: LoggingService,
    private _router: Router
  ) {}

  getListScreenInfo(prettyName: string, params: Params): Observable<SearchScreenResultDTO> {
    this._loadingIndicatorService.start();

    return this._httpClient.get(`${this._envService.baseUrl}/search/screens${prettyName}`, { params }).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      map((response: AppResponseSearchScreenResultDTO) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  getSearchScreenInfo(params: Params): Observable<SearchScreenResultDTO> {
    this._loadingIndicatorService.start();

    return this._httpClient.get(`${this._envService.baseUrl}/search/screens/products`, { params }).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      map((response: AppResponseSearchScreenResultDTO) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  searchBy(
    baseQuery: string,
    pageParams: HttpParams,
    filterParams = new HttpParams(),
    sortParams = new HttpParams(),
    textFilter: string | null
  ): Observable<ProductSearchInfoWithMetaData> {
    this._loadingIndicatorService.start();
    //
    let params = new HttpParams();
    pageParams.keys().forEach((key) => {
      params = params.set(key, pageParams.get(key));
    });
    filterParams.keys().forEach((key) => {
      params = params.set(
        key,
        filterParams
          .getAll(key)
          .reduce((prev, curr) => `${prev},${curr}`, '')
          .replace(',', '')
      );
    });
    sortParams.keys().forEach((key) => {
      params = params.set(key, sortParams.get(key));
    });
    //
    return this._httpClient.get(`${this._envService.baseUrl}/products/search${baseQuery}`, { params }).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      map((response: ServiceResponseProductSearchInfoWithMetaData) => response.data),
      tap(() => {
        const paramString = textFilter ? `q=${textFilter}&${params.toString()}` : params.toString();
        const paramStringWithQuery = paramString.length ? `?${paramString}` : paramString;
        history.replaceState(null, null, location.origin + location.pathname + paramStringWithQuery);
      }),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }
}
