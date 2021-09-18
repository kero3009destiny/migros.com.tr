import { Component, Input } from '@angular/core';

import { GtmService } from '@fe-commerce/core';

import { StoreProductInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'fe-product-search-result-item',
  templateUrl: './search-result-item.component.html',
  styleUrls: ['./search-result-item.component.scss'],
})
export class SearchResultItemComponent {
  @Input() result: StoreProductInfoDTO;

  constructor(private _gtmService: GtmService) {}

  sendGtmClickEvent(product: StoreProductInfoDTO) {
    const list = 'Search Results';
    this._gtmService.sendProductClickEvent({ product, list });
  }
}
