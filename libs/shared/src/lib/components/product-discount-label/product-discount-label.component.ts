import { Component, Input } from '@angular/core';

import { StoreProductBadge } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'fe-product-discount-label',
  templateUrl: './product-discount-label.component.html',
  styleUrls: ['./product-discount-label.component.scss'],
})
export class ProductDiscountLabelComponent {
  @Input() badges: Array<StoreProductBadge>;
  @Input() discounts: { [p: string]: Array<string> } = {};

  getClassName(badge): string {
    const index = badge?.name?.indexOf('_');
    return badge?.name?.toLowerCase().substring(0, index);
  }

  getBadgeLabel(badge): string {
    return badge?.name === 'PRICE_PROMOTED' ? 'İndirimli Ürün' : badge?.value;
  }

  /**
   * Max length of discounts is 1
   */
  isDiscountsExist(): boolean {
    return Object.keys(this.discounts).length > 0;
  }

  /**
   * There will be only one key - value pair in this discounts object
   */
  getDiscountLabel(): string {
    return this.discounts[Object.keys(this.discounts)[0]][0];
  }
}
