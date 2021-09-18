import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import {
  LoggingInterceptor,
  MockResponseInterceptor,
  ServerErrorInterceptor,
  UnavailableItemsInterceptor,
} from './interceptors';
import { CompositeErrorHandler } from './services/composite-error.handler';

@NgModule({
  declarations: [],
  imports: [CommonModule, MatSnackBarModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
      multi: true,
    },
    { provide: ErrorHandler, useClass: CompositeErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnavailableItemsInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockResponseInterceptor,
      multi: true,
    },
  ],
})
export class ErrorModule {}
