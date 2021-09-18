import { Component, Input } from '@angular/core';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';
import { StoreProductInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-product-discounts',
  templateUrl: './product-discounts.component.html',
  styleUrls: ['./product-discounts.component.scss'],
})
export class ProductDiscountsComponent {
  @Input() product: StoreProductInfoDTO;

  getDiscountPercent(): null | number {
    if (this.product.regularPrice === this.product.shownPrice) {
      return null;
    }
    return 100 - Math.round((100 * this.product.shownPrice) / this.product.regularPrice);
  }

  hasProductBadge(): boolean {
    return this.product.badges.filter((badge) => badge.name === 'CROSS_PROMOTED').length !== 0;
  }

  getProductBadgeLabel(): string {
    return this.product.badges.filter((badge) => badge.name === 'CROSS_PROMOTED')[0]?.value?.toLocaleUpperCase('tr');
  }

  hasSpecialBadge(): boolean {
    return this.product.badges.filter((badge) => badge.name === 'SPECIAL_PROMOTED').length !== 0;
  }

  getSpecialBadgeLabel(): string {
    return this.product.badges.filter((badge) => badge.name === 'SPECIAL_PROMOTED')[0]?.value.toLocaleUpperCase('tr');
  }

  hasCrmBadge(): boolean {
    return this.product.crmDiscountTags.length !== 0;
  }

  getCrmBadgeLabel(): string {
    return this.product.crmDiscountTags[0]?.tag.toLocaleUpperCase('tr');
  }

  getChevronRightIcon(): IconProp {
    return faChevronRight;
  }
}
