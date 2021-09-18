import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';

import { BannerRestControllerService } from '@migroscomtr/sanalmarket-angular';
import SwiperCore, { A11y, Autoplay, Lazy, Navigation, Pagination } from 'swiper/core';
import { BannerModel } from '../../models';

SwiperCore.use([A11y, Autoplay, Lazy, Navigation, Pagination]);

@Component({
  selector: 'fe-swiper-banner',
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
  }
  @Input() set eventIdMap(value: Record<number, string>) {
    this._eventIdMap = value;
  }
  @Output() onClickEvents: EventEmitter<{ banner: BannerModel; index: number }> = new EventEmitter();
  @Output() onHandlePromoView: EventEmitter<{ banner: BannerModel; index: number }> = new EventEmitter();
  private input: { banner: BannerModel; index: number };

  constructor(private _bannerRestController: BannerRestControllerService, private _router: Router) {}

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
    return banner.callToActionUrl;
  }

  onClickBanner(banner: BannerModel, event: MouseEvent, index: number): void {
    event.preventDefault();
    this.input = { banner, index };
    this.onClickEvents.emit(this.input);
    this._bannerRestController
      // @ts-expect-error we have to send eventId as string because of the number overflow issues
      .onClickBanner({ bannerId: banner.id, eventId: banner.referrerEventId })
      .subscribe(() => {
        const url = this.getBannerUrl(banner);

        if (this._isValidHttpUrl(url)) {
          window.location.href = url;
          return;
        }

        this._router.navigateByUrl(this.getBannerUrl(banner), {
          state: { referrerEventId: banner.referrerEventId },
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
        this.input = { banner: currentBanner, index };
        this.onHandlePromoView.emit(this.input);
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
