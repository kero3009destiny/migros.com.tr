import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { PortfolioEnum } from '../app-state/app-state.service';
import { BaseUrlConverterService } from '../base-url-converter/base-url-converter.service';

@Injectable({
  providedIn: 'root',
})
export class RouteGuard implements CanActivate {
  constructor(private _router: Router, private _baseUrlConverter: BaseUrlConverterService) {}

  /**
   * This guard's purpose is to redirect according to app's state
   * e.g. if user is in electronic state and wants to go to /sepetim page via any button or url,
   * this guard will redirect user to /elektronik/sepetim  instead of /sepetim
   */
  canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot) {
    let targetUrl = routerStateSnapshot.url;

    targetUrl = Object.keys(activatedRouteSnapshot.queryParams).length > 0 ? targetUrl.split('?')[0] : targetUrl;

    if (
      this._baseUrlConverter.isRedirectNeeded(targetUrl, PortfolioEnum.KURBAN) ||
      this._baseUrlConverter.isRedirectNeeded(targetUrl, PortfolioEnum.ELECTRONIC) ||
      this._baseUrlConverter.isRedirectNeeded(targetUrl, PortfolioEnum.HEMEN)
    ) {
      this._router.navigate([this._baseUrlConverter.convertNavigationUrl(targetUrl)], {
        queryParams: activatedRouteSnapshot.queryParams,
        state: this._router.getCurrentNavigation().extras?.state,
      });
      return false;
    }
    return true;
  }
}
