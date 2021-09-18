import { Component, Inject } from '@angular/core'
import { SHORTFALL_DATA } from '../../injectors'
import { FormatPricePipe } from '@fe-commerce/shared'

@Component({
  selector: 'fe-shortfall-product-list',
  templateUrl: './shortfall-product-list.component.html',
  styleUrls: ['./shortfall-product-list.component.scss'],
})
export class ShortfallProductListComponent {
  constructor(@Inject(SHORTFALL_DATA) public data, private _formatPricePipe: FormatPricePipe) {}

  getKurusToLiraRevenue(price: number) {
    return this._formatPricePipe.transform(price)
  }
}
