import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ProductPropertiesModel } from '@fe-commerce/shared';

@Component({
  selector: 'fe-product-detail-tabs',
  templateUrl: './product-detail-tabs.component.html',
  styleUrls: ['./product-detail-tabs.component.scss'],
})
export class ProductDetailTabsComponent {
  @Input() productDescription: string;
  @Input() productProperties: ProductPropertiesModel;
  @Input() migros = false;
  columns = ['key', 'value'];

  constructor(private _sanitizer: DomSanitizer) {}

  getSafeVideoUrl(): SafeResourceUrl {
    return this._sanitizer.bypassSecurityTrustResourceUrl(this.productProperties.MISC['Video']);
  }

  hasVideoProperty(): boolean {
    return this.productProperties?.MISC ? !!this.productProperties?.MISC['Video'] : false;
  }

  hasImageProperty(): boolean {
    return this.productProperties?.MISC ? !!this.productProperties?.MISC['productDetailsImage'] : false;
  }
  getImageProperty(): string {
    return this.productProperties?.MISC['productDetailsImage'];
  }
}
