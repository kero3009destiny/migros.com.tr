import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvService } from '@fe-commerce/env-service';
import { ToasterService } from '@fe-commerce/shared';

import { UserDTO } from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  user: UserDTO;
  _isProduction = false;

  constructor(private _envService: EnvService, private _toasterService: ToasterService) {
    this._isProduction = this._envService.production;
  }

  logSuccess({ message, title }): void {
    this._toasterService.showToaster({
      settings: {
        state: 'success',
      },
      data: {
        title,
        message,
      },
    });
  }

  logError({ message, title }): void {
    this._toasterService.showToaster({
      settings: {
        state: 'danger',
      },
      data: {
        title,
        message,
      },
    });
  }

  logInfo({ message, title }): void {
    this._toasterService.showToaster({
      settings: {
        state: 'information',
      },
      data: {
        title,
        message,
      },
    });
  }

  logHttpError({ message, title, error }): void {
    // stack will use for error monitoring services
    try {
      const isHttpErrorResponse = error instanceof HttpErrorResponse;
      const hasDuplicatedErrorMessage = error?.errorDetail === error?.error?.violations?.errorDetail;

      if (isHttpErrorResponse) {
        this._toasterService.showToaster({
          settings: {
            state: 'danger',
          },
          data: {
            title,
            message,
            violations: hasDuplicatedErrorMessage ? null : (error.error && error.error.violations) || null,
          },
        });
      }
    } catch (innerError) {
      if (!this._isProduction) {
        // Here protecting error types, needs to be a certain type, if it is not, we are sending that too.
        console.error(innerError);
      }
    }
  }
}
