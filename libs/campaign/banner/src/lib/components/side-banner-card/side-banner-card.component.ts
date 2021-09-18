import { Component, Input } from '@angular/core';

import { BannerResponseDTO } from '@migroscomtr/sanalmarket-angular';

import { BannerService } from '../../services/banner.service';

@Component({
  selector: 'fe-campaign-banner-side-banner-card',
  templateUrl: './side-banner-card.component.html',
  styleUrls: ['./side-banner-card.component.scss'],
})
export class SideBannerCardComponent {
  @Input() title;
  @Input() banner: BannerResponseDTO;

  constructor(private _bannerService: BannerService) {}

  /**
   * Temporary method for not showing ADD_TO_CART type banner objects until addIfAbsent is implemented for REST
   */
  isBannerCardVisible(): boolean {
    return this.banner.callToActionType !== 'ADD_TO_CART';
  }

  /**
   * ADD_TO_CART type banner object has callToActionUrl equals to '/sepetim/ekle/55454663'
   * CartAjaxService has a method called addIfAbsent and has /ekle/{sku} url
   * There no REST endpoint for that
   */
  addProductToCart(): void {
    // Will be implemented
    this._bannerService.onClickBanner(this.banner.id, this.banner.referrerEventId);
  }
}
