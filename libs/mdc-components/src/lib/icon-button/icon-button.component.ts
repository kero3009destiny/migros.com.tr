import { Component, Input } from '@angular/core'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

@Component({
  selector: 'fe-icon-button',
  templateUrl: './icon-button.component.html',
})
export class IconButtonComponent {
  @Input() icon: IconProp
}
