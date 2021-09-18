import { Component, Input, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'fe-product-shortfall-info',
  templateUrl: './product-shortfall-info.component.html',
  styleUrls: ['./product-shortfall-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductShortfallInfoComponent {
  @Input() fallCount: number
  @Input() inCartCount = 0

  get inCartCountDefault() {
    return this.inCartCount ? this.inCartCount : 0
  }
}
