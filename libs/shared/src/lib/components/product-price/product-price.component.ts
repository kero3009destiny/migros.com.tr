import { Component, Input } from '@angular/core';

import { ProductBadgeInfoModel } from '../../models';

@Component({
  selector: 'fe-product-price',
  templateUrl: './product-price.component.html',
  styleUrls: ['./product-price.component.scss'],
})
export class ProductPriceComponent {
  @Input() showPromotionLabel = false;
  @Input() shownPrice: number;
  @Input() regularPrice: number;
  @Input() promotion: ProductBadgeInfoModel;

  get showPromotion() {
    return this.promotion && this.promotion.name !== 'PRICE_PROMOTED';
  }

  get hasPriceDiscount() {
    return !!this.regularPrice && this.shownPrice !== this.regularPrice;
  }
}
