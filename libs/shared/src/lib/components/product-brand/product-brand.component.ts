import { Component, Input } from '@angular/core';

import { ProductBrandInfo } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'fe-product-brand',
  templateUrl: './product-brand.component.html',
  styleUrls: ['./product-brand.component.scss'],
})
export class ProductBrandComponent {
  @Input() brand: ProductBrandInfo & { prettyName: string };
}
