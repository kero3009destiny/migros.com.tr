import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';

import { BugsnagErrorHandlerService } from '../handlers/bugsnag-error.handler';
import { ChunkErrorHandler } from '../handlers/chunk-error.handler';

@Injectable()
export class CompositeErrorHandler implements ErrorHandler {
  constructor(
    private _bugsnagErrorHandler: BugsnagErrorHandlerService,
    private _chunkErrorHandler: ChunkErrorHandler
  ) {}

  handleError(error: any): void {
    const isServerError = error instanceof HttpErrorResponse;
    const isClientBasedServerError = isServerError && Math.floor(error.status / 100) === 4;

    if (this._chunkErrorHandler.shouldHandle(error)) {
      this._chunkErrorHandler.handleError(error);
    } else if (!isServerError || isClientBasedServerError) {
      this._bugsnagErrorHandler.handleError(error);
    }
  }
}
