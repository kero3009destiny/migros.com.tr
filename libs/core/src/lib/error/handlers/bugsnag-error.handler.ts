import { ErrorHandler, Injectable } from '@angular/core';

import { EnvService } from '@fe-commerce/env-service';

import Bugsnag, { Client, Event } from '@bugsnag/js';

@Injectable({
  providedIn: 'root',
})
export class BugsnagErrorHandlerService implements ErrorHandler {
  private _errorHandler: BugsnagErrorHandler;

  constructor(private _envService: EnvService) {
    const client = Bugsnag.start({
      releaseStage: this._envService.name,
      enabledReleaseStages: ['stage', 'prod'],
      apiKey: this._envService.BUGSNAG_API_KEY,
      appVersion: this._envService.version,
      onError: (event) => {
        if (this._originatesFromExternalScripts(event)) {
          event.context = 'gtm';
        }
      },
    });
    this._errorHandler = new BugsnagErrorHandler(client);
  }

  handleError(error: any): void {
    this._errorHandler.handleError(error);
  }

  private _originatesFromExternalScripts = (event: Event) =>
    event?.errors?.length &&
    event.errors[0].stacktrace
      .map((st) => st.file)
      .filter((file) => !!file)
      .filter((file) => !file.includes('fe-commerce')).length > 0;
}

class BugsnagErrorHandler extends ErrorHandler {
  public bugsnagClient: Client;

  constructor(client?: Client) {
    super();
    if (client) {
      this.bugsnagClient = client;
    } else {
      this.bugsnagClient = (Bugsnag as any)._client as Client;
    }
  }

  public handleError(error: any): void {
    const handledState = {
      severity: 'error',
      severityReason: { type: 'unhandledException' },
      unhandled: true,
    };

    const event = this.bugsnagClient.Event.create(error, true, handledState, 'angular error handler', 1);

    if (error.ngDebugContext) {
      event.addMetadata('angular', {
        component: error.ngDebugContext.component,
        context: error.ngDebugContext.context,
      });
    }

    this.bugsnagClient._notify(event);
    ErrorHandler.prototype.handleError.call(this, error);
  }
}
