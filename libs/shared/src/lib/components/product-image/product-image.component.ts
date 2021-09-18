import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ImageUrls } from '@migroscomtr/sanalmarket-angular';

import { ProductImageModel } from '../../models';

@Component({
  selector: 'fe-product-image',
  templateUrl: './product-image.component.html',
  styleUrls: ['./product-image.component.scss'],
})
export class ProductImageComponent {
  @Input() image: ProductImageModel | ImageUrls;
  @Input() referrerEventId: string;
  @Input() prettyName: string;
  @Input() productName: string;
  @Input() imageType = 'PRODUCT_DETAIL';
  @Input() lazyLoad = true;
  @Input() asLink = true;
  @Output() gtmClick = new EventEmitter<string>();
  @Input() queryParams = {};

  sendGtmClick() {
    this.gtmClick.emit();
  }

  getImageUrl(imageType: string): string {
    return this.image?.urls?.[imageType] ? this.image?.urls?.[imageType] : this.image?.urls?.['PRODUCT_LIST'];
  }
}
