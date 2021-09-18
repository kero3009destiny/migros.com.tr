import { Injectable } from '@angular/core';

import { EnvService } from '@fe-commerce/env-service';

import { AppStateService, PortfolioEnum } from '../app-state/app-state.service';

@Injectable({
  providedIn: 'root',
})
export class BaseUrlConverterService {
  private _portfolio: PortfolioEnum;
  private _enabledMap = {
    [PortfolioEnum.KURBAN]: this._envService.isKurbanEnabled ?? false,
    [PortfolioEnum.ELECTRONIC]: this._envService.isElectronicEnabled ?? false,
    [PortfolioEnum.HEMEN]: this._envService.isHemenEnabled ?? false,
    [PortfolioEnum.MARKET]: true,
  };

  constructor(private _envService: EnvService, private _appState: AppStateService) {
    _appState.getPortfolio$().subscribe((portfolio) => {
      this._portfolio = portfolio;
    });
  }

  convertNavigationUrl(url: string): string {
    return `${this._portfolio}/${url}`;
  }

  convertRequestUrl(url: string): string {
    let requestUrl = url;
    const newUrl =
      this._portfolio === PortfolioEnum.ELECTRONIC
        ? this._envService.electronicBaseUrl
        : this._portfolio === PortfolioEnum.KURBAN
        ? this._envService.kurbanBaseUrl
        : this._portfolio === PortfolioEnum.HEMEN
        ? this._envService.hemenBaseUrl
        : this._envService.baseUrl;

    requestUrl = requestUrl.replace(this._envService.baseUrl, newUrl);

    return requestUrl;
  }

  isRedirectNeeded(targetUrl, targetPortfolio: string): boolean {
    return (
      this._portfolio === targetPortfolio &&
      this._enabledMap[this._portfolio] &&
      !targetUrl.includes(`/${targetPortfolio}`)
    );
  }
}
