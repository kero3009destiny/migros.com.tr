import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { Browser } from '@fe-commerce/core';
import { presenceAnimationTrigger } from '@fe-commerce/shared';

const PREVIEW_ZOOM_RATIO = 1.5;

@Component({
  selector: 'sm-product-images',
  templateUrl: './product-images.component.html',
  styleUrls: ['./product-images.component.scss'],
  animations: [presenceAnimationTrigger],
  encapsulation: ViewEncapsulation.None,
})
export class ProductImagesComponent implements OnInit {
  @ViewChild('preview') previewElement: ElementRef;
  @Input() allowTouchMove = true;
  @Input() bullets = false;
  @Input() zoom = true;
  @Input() activeIndex = 0;
  @Input() images;
  @Output() productImageClicked = new EventEmitter<number>();

  private _isPreviewVisible = false;
  private _activeIndex = 0;

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._activeIndex = this.activeIndex;
  }

  getActiveIndex(): number {
    return this._activeIndex;
  }

  isMobile(): boolean {
    return Browser.isMobile();
  }

  isPreviewVisible(): boolean {
    return this._isPreviewVisible;
  }

  hasMoreThanOneImage(): boolean {
    return this.images.length > 1;
  }

  onChangeActiveIndex(activeIndex: number): void {
    this._activeIndex = activeIndex;
  }

  onClickImageCell(index: number): void {
    this._activeIndex = index;
  }

  onClickProductImage(): void {
    if (!this.zoom && !Browser.isMobile()) {
      return;
    }
    this.productImageClicked.emit(this._activeIndex);
  }

  onMouseEnter(): void {
    this._isPreviewVisible = true;
    this._cdr.detectChanges();

    this.previewElement.nativeElement.style.backgroundImage = `url(${
      this.images[this.getActiveIndex()]?.urls.PRODUCT_HD
    })`;
  }

  onMouseLeave(): void {
    this._isPreviewVisible = false;
  }

  onMouseMove(event: MouseEvent, productImages): void {
    const wrapper = productImages.getBoundingClientRect();
    const posX = event.clientX - wrapper.left;
    const posY = event.clientY - wrapper.top;

    this.previewElement.nativeElement.style.backgroundPosition = `-${posX / PREVIEW_ZOOM_RATIO}px -${
      posY / PREVIEW_ZOOM_RATIO
    }px`;
  }
}
