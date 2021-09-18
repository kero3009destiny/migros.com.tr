import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { BaseUrlConverterService } from '../../services';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(private _baseUrlConverter: BaseUrlConverterService) {}

  /**
   * This interceptor changes request url according to app's state
   */
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const clonedReq = req.clone({ url: this._baseUrlConverter.convertRequestUrl(req.url) });
    return next.handle(clonedReq);
  }
}
