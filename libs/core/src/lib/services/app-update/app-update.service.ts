import { ApplicationRef, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

import { concat, interval, Subscription } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { DialogDataModel } from '../../models';

export const RELEASE_INFO = new InjectionToken<DialogDataModel>('DialogDataModel');

@Injectable({
  providedIn: 'root',
})
export class AppUpdateService implements OnDestroy {
  private _subscription = new Subscription();

  private _updateAvailable = false;

  constructor(private _appRef: ApplicationRef, private _swUpdate: SwUpdate, private _router: Router) {
    if (this._swUpdate.isEnabled) {
      this._subscription.add(this._checkUpdate());
      this._subscription.add(this._onUpdate());
      this._subscription.add(this._update());
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  private _checkUpdate = () => {
    // Allow the app to stabilize first, before starting polling for updates with `interval()`.
    const appIsStable$ = this._appRef.isStable.pipe(first((isStable) => isStable === true));
    const everyTenMin$ = interval(10 * 60 * 1000);
    return concat(appIsStable$, everyTenMin$).subscribe(() => this._swUpdate.checkForUpdate());
  };

  private _onUpdate = () => {
    return this._swUpdate.available.subscribe((event) => {
      this._swUpdate.activateUpdate().then(() => {
        this._updateAvailable = true;
      });
    });
  };

  private _update() {
    return this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter(() => this._updateAvailable)
      )
      .subscribe((event: NavigationEnd) => {
        /**
         * Calling activateUpdate() without reloading the page could break lazy-loading in a currently running app,
         * especially if the lazy-loaded chunks use filenames with hashes, which change every version.
         * Therefore, it is recommended to reload the page once the promise returned by activateUpdate() is resolved.
         * https://angular.io/guide/service-worker-communications#forcing-update-activation
         */
        window.location.reload();
      });
  }
}
