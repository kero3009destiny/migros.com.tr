import { Component, Inject } from '@angular/core'
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar'
import { ToasterDataModel } from '../models/ToasterModel'

@Component({
  selector: 'fe-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss'],
})
export class ToasterComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: ToasterDataModel) {}

  get iconClass() {
    return `icon icon-${this.data.icon}`
  }

  get violationMessages() {
    return this.data.violations
      .reduce((acc, item) => {
        acc.push(item.errorDetail)
        return acc
      }, [])
      .join(',')
  }
}
