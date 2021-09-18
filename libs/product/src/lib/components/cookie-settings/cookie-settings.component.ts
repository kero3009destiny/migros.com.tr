import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { AppStateService, GtmService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';

import { User } from '@bugsnag/js';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';

import { CookieSettings, CookieSettingsService } from '../../services';

@Component({
  selector: 'fe-product-cookie-settings',
  templateUrl: './cookie-settings.component.html',
  styleUrls: ['./cookie-settings.component.scss'],
})
export class CookieSettingsComponent implements OnInit {
  @Output() closeEvent = new EventEmitter<boolean>();

  analyseCookies = true;
  marketingCookies = true;
  user: User;

  constructor(
    private gtmService: GtmService,
    private cookieSettingsService: CookieSettingsService,
    private _envService: EnvService,
    private router: Router,
    private _appState: AppStateService
  ) {}

  // ICONS
  closeIcon = faTimes;

  ngOnInit() {
    this.assignSettings();
  }

  isMacroonline(): boolean {
    return this._envService.companyName.includes('Macroonline');
  }

  getCookieUrl(): string {
    return 'islem-rehberi' + '?id=777';
  }

  onClickCookieUrl(event: MouseEvent): void {
    event.preventDefault();
    this.router.navigate(['islem-rehberi'], { queryParams: { id: 777 } });
  }

  onSaveCookieSettings(): void {
    const updatedCookieSettings: CookieSettings = {
      analyseCookies: this.analyseCookies,
      marketingCookies: this.marketingCookies,
    };
    this.gtmService.updateConsentGoogleAnalytics(!this.analyseCookies);
    this.gtmService.updateConsentAdStorage(!this.marketingCookies);
    this.cookieSettingsService.setCookieSettings(updatedCookieSettings);
    this.cookieSettingsService.onUserInteractCookieSettings();
    this._appState.setCookieIndicatorVisibility(false);
    this._appState.setCookieIndicatorVisibility(false);
    this.onClickClose();
  }

  assignSettings(): void {
    const cookieSettings: CookieSettings = this.cookieSettingsService.getCookieSettings();
    if (!cookieSettings) {
      return;
    }
    ({ analyseCookies: this.analyseCookies, marketingCookies: this.marketingCookies } = cookieSettings);
  }

  onClickClose(): void {
    this.closeEvent.emit();
  }
}
