import { Injectable } from '@angular/core';

import { AppStateService } from '@fe-commerce/core';

import { CookieService } from 'ngx-cookie-service';

export interface CookieSettings {
  indicatorSeen?: boolean;
  analyseCookies?: boolean;
  marketingCookies?: boolean;
}

@Injectable()
export class CookieSettingsService {
  readonly cookieSettingsName = 'cookieSettings';

  constructor(private _cookieService: CookieService, private _appStateService: AppStateService) {}

  setCookieSettings(newCookieSettings?: CookieSettings): void {
    if (!newCookieSettings) {
      const defaultCookieSettings: CookieSettings = {
        indicatorSeen: false,
        analyseCookies: true,
        marketingCookies: true,
      };
      this._cookieService.set(this.cookieSettingsName, JSON.stringify(defaultCookieSettings));
    } else {
      const cookieSettings = JSON.parse(this._cookieService.get(this.cookieSettingsName));
      const updatedSettings = { ...cookieSettings, ...newCookieSettings };
      this._cookieService.set(this.cookieSettingsName, JSON.stringify(updatedSettings));
    }
  }

  getCookieSettings(): CookieSettings {
    return JSON.parse(this._cookieService.get(this.cookieSettingsName));
  }

  onUserInteractCookieSettings(): void {
    const cookieSettings: CookieSettings = JSON.parse(this._cookieService.get(this.cookieSettingsName));
    cookieSettings.indicatorSeen = true;
    this._cookieService.set(this.cookieSettingsName, JSON.stringify(cookieSettings));
  }

  checkIfIndicatorSeenBefore(): void {
    const cookieSettings = this._cookieService.get(this.cookieSettingsName);
    if (!cookieSettings) {
      this._appStateService.setCookieIndicatorVisibility(true);
      this.setCookieSettings();
    } else {
      const cookieSettingsJson: CookieSettings = JSON.parse(this._cookieService.get(this.cookieSettingsName));
      this._appStateService.setCookieIndicatorVisibility(!cookieSettingsJson.indicatorSeen);
    }
  }
}
