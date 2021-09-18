import { BreakpointObserver } from '@angular/cdk/layout';
import {
  AfterViewInit,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';

import Flickity from 'flickity';

import { BreakpointObserverRef } from '../../directives';

type CarouselTypes = 'image' | 'any';

/**
 * This component is a generic carousel with chevron-right & chevron-left buttons
 *
 * @Input carouselItems : gets any type
 * @Input type: 'image' or 'any'
 * @Input imagePropertyNames : get object property name array, means the way you access img url
 *
 *      e.g. ProductImageModel -> in order to get url from this model you have to access 'urls' property with
 *      ProductImageType like 'PRODUCT_DETAIL'. Simply send ['urls', 'PRODUCT_DETAIL'] as input
 *
 * @Output imageClicked : Parent will decide the action on image clicked
 * @Output changedIndex : Whenever selected index is changed this event will be thrown
 *
 * Dependencies: Flickity library, BreakpointObserver
 */
@Component({
  selector: 'fe-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent<T> extends BreakpointObserverRef implements OnDestroy, OnChanges, AfterViewInit {
  @ContentChild('carouselCard') carouselTemplateRef: TemplateRef<any>;

  @Input() carouselItems: T[];
  @Input() currentIndex = 0;
  @Input() imagePropertyNames: string[] = [];
  @Input() type: CarouselTypes = 'image';
  @Input() padding = '0';

  @Output() changedIndex: EventEmitter<number> = new EventEmitter<number>();
  @Output() imageClicked: EventEmitter<T> = new EventEmitter<T>();

  selectedImage: T;
  flickity: Flickity;

  constructor(public breakpointObserver: BreakpointObserver) {
    super(breakpointObserver);
  }

  ngAfterViewInit() {
    this.selectedImage = this.carouselItems[this.currentIndex];
    this.initSlider();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.carouselItems || changes.imagePropertyNames) {
      this.reInitSlider();
    }

    if (changes.currentIndex) {
      this.changeCurrentIndex(changes.currentIndex.currentValue);
      if (this.flickity) this.flickity.select(this.currentIndex);
    }
  }

  isImageCarousel(): boolean {
    return this.type === 'image';
  }

  getPaddingValue(): string {
    return this.padding;
  }

  private initSlider(): void {
    if (this.carouselItems.length > 1 || (!this.isImageCarousel() && this.carouselItems.length > 0)) {
      setTimeout(() => {
        this.flickity = new Flickity('.carousel-container', {
          cellAlign: this.isImageCarousel() ? 'center' : 'left',
          pageDots: false,
          prevNextButtons: true,
          groupCells: !this.isImageCarousel(),
          wrapAround: this.isImageCarousel(),
          draggable: true,
          lazyLoad: true,
          on: {
            change: (index) => this.changeCurrentIndex(index),
          },
        });
      }, 0);
    }
  }

  private reInitSlider(): void {
    this.changeCurrentIndex(0);
    this.initSlider();
  }

  changeCurrentIndex(index: number): void {
    this.selectedImage = this.carouselItems[index];
    this.currentIndex = index;
    this.changedIndex.next(this.currentIndex);
  }

  onImageClick(image: T): void {
    this.imageClicked.next(image);
  }

  getImageSrc(image: T): T {
    let url = image;
    if (this.imagePropertyNames) this.imagePropertyNames.forEach((propertyName) => (url = url[propertyName]));
    return url;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.flickity) this.flickity.destroy();
  }
}
