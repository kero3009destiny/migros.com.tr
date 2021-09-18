import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { SystemCookiesService } from '@fe-commerce/core';

import { catchError, filter, switchMap } from 'rxjs/operators';

import {
  OtpAuthenticationControllerService,
  TransitionAuthenticationControllerService,
} from '@migroscomtr/sanalmarket-angular';
import { Subscription, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private _transitionAuthenticationRestController: TransitionAuthenticationControllerService,
    private _activatedRoute: ActivatedRoute,
    private _otpAuthControllerService: OtpAuthenticationControllerService,
    private _systemCookiesService: SystemCookiesService
  ) {}

  subscribeToFakeLogin$() {
    return this._activatedRoute.queryParams.pipe(
      filter((params) => params['agent-token'] !== undefined),
      switchMap((queryParams: Params) => this.getFakeLoginSession(queryParams))
    );
  }

  logout(): Subscription {
    return this._otpAuthControllerService
      .logout()
      .pipe(catchError((error) => throwError(error)))
      .subscribe(() => {
        this._systemCookiesService.removeUserCredentials();
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
  }

  private getFakeLoginSession(queryParams) {
    const agentToken = queryParams['agent-token'];
    const utmSource = queryParams['utm_source'];
    const utmMedium = queryParams['utm_medium'];

    return this._transitionAuthenticationRestController
      .login1(agentToken, utmSource, utmMedium)
      .pipe(catchError((error) => throwError(error)));
  }
}
