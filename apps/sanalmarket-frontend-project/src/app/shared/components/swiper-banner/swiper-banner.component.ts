import { Component, Input, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { AppStateService, GtmService, ReferrerEventService } from '@fe-commerce/core';
import { BannerModel } from '@fe-commerce/shared';

import { BannerRestControllerService } from '@migroscomtr/sanalmarket-angular';
import SwiperCore, { A11y, Autoplay, Lazy, Navigation, Pagination } from 'swiper/core';

SwiperCore.use([A11y, Autoplay, Lazy, Navigation, Pagination]);

@Component({
  selector: 'sm-swiper-banner',
  templateUrl: './swiper-banner.component.html',
  styleUrls: ['./swiper-banner.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SwiperBannerComponent implements OnChanges {
  @Input() inViewport: boolean;
  @ViewChild('swiperElRef') swiperElRef: any;

  private _banners: BannerModel[];
  private _eventIdMap: Record<number, string>;
  private monitoredBanners: BannerModel[] = [];

  @Input() set banners(value: BannerModel[]) {
    this._banners = value;
    this._eventIdMap = this._banners.reduce(
      (prev, curr) => ({ ...prev, [curr.id]: this._referrerEventService.generateNewEventId() }),
      {} as Record<number, string>
    );
  }

  constructor(
    private _bannerRestController: BannerRestControllerService,
    private _referrerEventService: ReferrerEventService,
    private _router: Router,
    private _appStateService: AppStateService,
    private _gtmService: GtmService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const currentValue = changes.inViewport?.currentValue;
    const swiperCoreRef: SwiperCore = this.swiperElRef?.swiperRef;
    if (currentValue && swiperCoreRef) {
      const index = swiperCoreRef.realIndex;
      this.handlePromoView(index);
    }
  }

  getBanners(): BannerModel[] {
    return this._banners;
  }

  hasBanner(): boolean {
    return this._banners?.length > 0;
  }

  hasMoreThanOneBanner(): boolean {
    return this._banners?.length > 1;
  }

  hasRedirect(banner: BannerModel): boolean {
    return 'REDIRECT' === banner.callToActionType;
  }

  getBannerUrl(banner: BannerModel): string {
    // Necessary for open in new tab function
    if (!this._appStateService.isPortfolioMarket()) {
      return `${'/' + this._appStateService.getPortfolio() + banner.callToActionUrl}`;
    }
    return banner.callToActionUrl;
  }

  getEventId(banner: BannerModel): string {
    return this._eventIdMap[banner.id];
  }

  onClickBanner(banner: BannerModel, event: MouseEvent, index: number): void {
    event.preventDefault();
    this._referrerEventService.setObjectId(banner.referrerEventId);
    this._gtmService.sendBannerEvent('promoClick', banner, index);
    this._bannerRestController
      // @ts-expect-error we have to send eventId as string because of the number overflow issues
      .onClickBanner({ bannerId: banner.id, eventId: this.getEventId(banner) })
      .subscribe(() => {
        const url = this.getBannerUrl(banner);

        if (this._isValidHttpUrl(url)) {
          window.location.href = url;
          return;
        }

        this._router.navigateByUrl(this.getBannerUrl(banner), {
          state: { referrerEventId: this.getEventId(banner) },
        });
      });
  }

  onChangeSlide(slide: SwiperCore): void {
    const index = slide.realIndex;
    this.handlePromoView(index);
  }

  onInitSlider(): void {
    this.handlePromoView(0);
  }

  private handlePromoView(index: number): void {
    const currentBanner = this._banners[index];

    if (this.inViewport) {
      const isMonitored = this.monitoredBanners.find((monitoredBanner) => monitoredBanner.id === currentBanner.id);
      if (!isMonitored) {
        this.monitoredBanners.push(currentBanner);
        this._gtmService.sendBannerEvent('promoView', currentBanner, index);
      }
    }
  }

  private _isValidHttpUrl(string): boolean {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
  }
}
