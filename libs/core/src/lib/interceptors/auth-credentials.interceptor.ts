import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable()
export class AuthCredentialsInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      withCredentials: true,
      setHeaders: {
        'X-FORWARDED-REST': 'true',
        'X-PWA': 'true',
      },
    });

    return next.handle(request);
  }
}
