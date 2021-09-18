import { Component, OnInit } from '@angular/core';

import { AppStateService, GtmService } from '@fe-commerce/core';

import { faTimesCircle } from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'sm-mobile-app-popup',
  templateUrl: './mobile-app-popup.component.html',
  styleUrls: ['./mobile-app-popup.component.scss'],
})
export class MobileAppPopupComponent implements OnInit {
  closeIcon = faTimesCircle;
  popupVisible = true;

  constructor(private _appStateService: AppStateService, private _gtmService: GtmService) {}

  ngOnInit(): void {
    this._appStateService.setMobileAppPopupVisibility(true);
  }

  isPopupVisible(): boolean {
    return this.popupVisible;
  }

  onInsideViewPort(): void {
    if (this.popupVisible) {
      this._gtmService.sendPageView({ event: 'ecommerceMobileAppView', eventType: 'Mobile App View' });
    }
  }

  onClickPopupClose(): void {
    this.popupVisible = false;
    this._appStateService.setMobileAppPopupVisibility(false);
  }

  onClickOpenApp(): void {
    // adjust url it redirects or open apps
    const url = 'https://m2bf.adj.st?adj_t=xz9rbcr';
    this._gtmService.sendPageView({ event: 'ecommerceMobileAppClick', eventType: 'Mobile App Click' });
    this.onClickPopupClose();
    window.location.replace(url);
  }
}
