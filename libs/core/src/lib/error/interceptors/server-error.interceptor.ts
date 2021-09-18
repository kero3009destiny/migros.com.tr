import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, tap } from 'rxjs/operators';

import { throwError } from 'rxjs';

import { GtmService } from '../../services';
import { SystemCookiesService } from '../../services/system-cookies/system-cookies.service';
import { ErrorService } from '../services/error.service';
import { LoggingService } from '../services/logging.service';

interface LoggingErrorModel {
  error: unknown;
  message: unknown;
  title: unknown;
  stack: unknown;
}

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  FALLBACK_ERROR_MESSAGE = 'Bir hata oluştu.';
  FALLBACK_ERROR_TITLE = 'İşlem tamamlanamadı!';
  errorCodes = {
    401: 'Unauthorized Request',
    501: 'System Error',
    409: 'Already signed in',
    11051: 'Unknown issue',
    0: 'Not completed Http request: Cors',
  };

  errorCodeIgnoreList = {
    CART_NOT_FOUND: '11049',
    // CHECKOUT_NOT_FOUND: '11050', // can not ignore it. because causing problems in checkout
    ORDER_NOT_FOUND: '11051',
    // Account not found
    ACCOUNT_NOT_FOUND_OTP: '11021',
    // Money Pay errors
    NOT_REGISTERED: '99100',
    NOT_OTP_VERIFIED: '99101',
  };

  constructor(
    private _loggingService: LoggingService,
    private _errorService: ErrorService,
    private _router: Router,
    private _systemCookiesService: SystemCookiesService,
    private gtmService: GtmService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle http errors
        if (error.status === 400 || error.status === 500 || error.status === 404) {
          this.gtmService.sendErrorEvent(error.status);
        }
        // Handle unauthorized
        if (error.status === 401) {
          this._systemCookiesService.removeUserCredentials();
          this._loggingService.logError({
            message: 'Bu işlemi yapabilmek için giriş yapmalısın.',
            title: '',
          });
          return this._router.navigate(['/giris']);
        } else {
          return throwError(error);
        }
      }),
      tap((event: HttpResponse<unknown>) => {
        if (
          event instanceof HttpResponse && // check if response exist
          event.status === 200 && // check if it is successful HTTP request
          event.body && // check if has body
          event.body.successful === false // check if is failed from rest API
        ) {
          if (Object.values(this.errorCodeIgnoreList).indexOf(event.body.errorCode) !== -1) {
            // check if it is in ignore list
            return event;
          }
          const { successful, errorCode, errorDetail } = event.body;
          const errorCodeAsInteger = parseInt(errorCode, 10); // Get rid of post zeros
          const responseError = new HttpErrorResponse({
            ...event,
            error: { ...event.body, ok: successful }, // add 'ok' so it more likely a response error
            status: errorCodeAsInteger,
            statusText:
              errorDetail || this.errorMessageFromStatusCode(errorCodeAsInteger) || this.FALLBACK_ERROR_MESSAGE,
          });
          // Check if unauthorized error is from user action, like OTP.
          // On app init we are checking user and iif user not exist in SESSION API returns success: false without error details
          // This condition filters that and not warning user for SESSION control
          if (
            responseError instanceof HttpErrorResponse &&
            responseError.status === 401 &&
            (responseError.error.errorTitle === undefined || responseError.error.errorDetail === undefined)
          ) {
            return event;
          }

          this.logErrorToUser(responseError);
          // handle error cases here as we cannot catch them properly
          if (responseError.error.errorCode === '40002') {
            // existing user trying anonymous checkout
            this._router.navigateByUrl('/giris');
          }
          throw responseError;
        }
        return event;
      })
    );
  }

  logErrorToUser(responseError: HttpErrorResponse) {
    const { message, title, error }: LoggingErrorModel = this.makeErrorReadable(responseError);
    this._loggingService.logHttpError({ message, title, error });
  }

  makeErrorReadable(error: HttpErrorResponse): LoggingErrorModel {
    const hasViolations = error.error && error.error.violations && error.error.violations.length > 0;
    const errorMessage = error.error && error.error.errorDetail;

    const message = !hasViolations && !errorMessage ? this.FALLBACK_ERROR_MESSAGE : errorMessage;
    const title = error.error.errorTitle || this.FALLBACK_ERROR_TITLE;
    const stack = this._errorService.getServerStack(error);

    return {
      message,
      title,
      stack,
      error,
    };
  }

  errorMessageFromStatusCode(code: number) {
    return this.errorCodes[code];
  }
}
