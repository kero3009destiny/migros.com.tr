import { Injectable } from '@angular/core';

import { EnvService } from '@fe-commerce/env-service';

import { catchError } from 'rxjs/operators';

import { throwError } from 'rxjs';
import { TransitionAuthenticationControllerService } from '@migroscomtr/sanalmarket-angular';

import { GtmService } from '../gtm/gtm.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AppInitService {
  constructor(
    private _transitionAuthenticationRestController: TransitionAuthenticationControllerService,
    private _userService: UserService,
    private _gtmService: GtmService,
    private _envService: EnvService
  ) {}

  async init(): Promise<unknown> {
    // GTM is not a promise, adding script source to DOM and production only
    if (this._envService.name !== 'local' && this._envService.GTM) {
      this._gtmService.init({ GTM_ID: this._envService.GTM });
    }

    // Angular routing service is not initialized yet
    const url = new URL(window.location.href);
    const paramMap = url.searchParams;
    if (paramMap?.has('agent-token')) {
      await this.getFakeLoginSession(paramMap).toPromise();
    }

    return this._userService.getUserObservable().toPromise();
  }

  // TODO Remove duplication
  // TODO Cannot use auth service due to circular dependency
  private getFakeLoginSession(paramMap: URLSearchParams) {
    const agentToken = paramMap.get('agent-token');
    const utmSource = paramMap.get('utm_source');
    const utmMedium = paramMap.get('utm_medium');

    return this._transitionAuthenticationRestController
      .login1(agentToken, utmSource, utmMedium)
      .pipe(catchError((error) => throwError(error)));
  }
}
