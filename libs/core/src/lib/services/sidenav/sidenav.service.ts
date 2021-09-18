import { Injectable, OnDestroy } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationStart, Router } from '@angular/router';

import { Observable, of, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SideNavService implements OnDestroy {
  private _sidenav: MatSidenav;
  routerNavigationSubscription: Subscription;

  constructor(private _router: Router) {
    this.subscribeToRouterNavigation();
  }

  get isOpen$(): Observable<boolean> {
    return of(this._sidenav?.opened);
  }

  subscribeToRouterNavigation() {
    // When route change close side nav
    this.routerNavigationSubscription = this._router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((_) => this.close());
  }

  setSidenav(sidenav: MatSidenav) {
    this._sidenav = sidenav;
  }

  toggle() {
    this._sidenav?.toggle();
  }

  open() {
    this._sidenav?.open();
  }

  close() {
    this._sidenav?.close();
  }

  statusChanged(status: boolean) {
    if (this._sidenav) {
      this._sidenav.opened = status;
    }
  }

  ngOnDestroy() {
    this.routerNavigationSubscription.unsubscribe();
  }
}
