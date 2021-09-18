import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { ShortfallProductInfoModel } from '../../models'

@Component({
  selector: 'fe-shortfall-product-list-item',
  templateUrl: './shortfall-product-list-item.component.html',
  styleUrls: ['./shortfall-product-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShortfallProductListItemComponent {
  @Input() product: ShortfallProductInfoModel
}
