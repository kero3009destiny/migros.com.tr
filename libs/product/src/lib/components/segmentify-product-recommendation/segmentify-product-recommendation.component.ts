import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import {
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import { BreakpointObserverRef, CustomBreakPoints } from '@fe-commerce/shared';

import { fromEvent, Subscription } from 'rxjs';

import { StoreProductInfoDTO } from '@migroscomtr/sanalmarket-angular';
import SwiperCore, { A11y, Navigation } from 'swiper/core';

import { SegmentifyRecommendationService } from '../../services';

SwiperCore.use([A11y, Navigation]);

@Component({
  selector: 'fe-product-segmentify-recommendation',
  templateUrl: './segmentify-product-recommendation.component.html',
  styleUrls: ['./segmentify-product-recommendation.component.scss'],
  providers: [SegmentifyRecommendationService],
  encapsulation: ViewEncapsulation.None,
})
export class SegmentifyProductRecommendationComponent extends BreakpointObserverRef implements OnInit, OnDestroy {
  products: StoreProductInfoDTO[] = [];

  slidesPerView = 4;
  swiperButtonVisible = true;
  widgetVisible = false;
  navigationConfigs = { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' };

  private _recommendationsSubscription: Subscription;
  private _eventSubscription: Subscription;

  @Input() widgetLocation: 'cart' | 'product-detail';
  @Input() widgetTitle = 'Sizin için seçtiklerimiz';
  @ContentChild('recommendationCard') recommendationTemplateRef: TemplateRef<any>;

  constructor(
    public breakpointObserver: BreakpointObserver,
    private _segmentifyService: SegmentifyRecommendationService,
    private _elementRef: ElementRef
  ) {
    super(breakpointObserver);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._segmentifyService.setWidgetLocation(this.widgetLocation);
    this._segmentifyService.initSegmentify();
    this._recommendationsSubscription = this._segmentifyService.getProducts().subscribe((segmentifyProducts) => {
      this.products = segmentifyProducts;
      this.checkSlidesPerView();
    });
    this._eventSubscription = fromEvent(window, 'scroll').subscribe(() => {
      this.checkWidgetView();
    });
  }

  ngOnDestroy(): void {
    if (this._recommendationsSubscription) {
      this._recommendationsSubscription.unsubscribe();
    }
    if (this._eventSubscription) {
      this._eventSubscription.unsubscribe();
    }
  }

  isProductsVisible(): boolean {
    return this.products.length > 0;
  }

  isSwiperButtonVisible(): boolean {
    return this.swiperButtonVisible;
  }

  getQueryStringParams(): any {
    return this._segmentifyService.getQueryParams();
  }

  onScreenSizeChange(state: BreakpointState): void {
    if (state.breakpoints[CustomBreakPoints.xs]) {
      this.slidesPerView = 1.5;
    }
    if (state.breakpoints[CustomBreakPoints.sm]) {
      this.slidesPerView = 2.5;
    }
    if (state.breakpoints[CustomBreakPoints.md]) {
      this.slidesPerView = 3;
    }
    if (state.breakpoints[CustomBreakPoints.lg]) {
      this.slidesPerView = 4;
    }
    if (state.breakpoints[CustomBreakPoints.xl]) {
      this.slidesPerView = 4.5;
    }
    this.checkSlidesPerView();
  }

  checkSlidesPerView(): void {
    const productsLength = this.products.length;
    if (productsLength !== 0 && productsLength <= this.slidesPerView) {
      this.slidesPerView = this.products?.length;
      this.swiperButtonVisible = false;
    } else {
      this.swiperButtonVisible = true;
    }
  }

  checkWidgetView(): void {
    const element = this._elementRef.nativeElement;

    if (!this.widgetVisible) {
      const intersectionObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (this.isProductsVisible() && entry.isIntersecting && !this.widgetVisible) {
              this.widgetVisible = true;
              this._segmentifyService.onViewWidget();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.33 }
      );

      intersectionObserver.observe(element);
    }
  }

  productInteraction = (id: number): void => {
    this._segmentifyService.onProductInteraction(id.toString());
  };
}
