import { Component, Input } from '@angular/core';

import { IconDefinition } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'fe-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() label = '';
  @Input() icon: IconDefinition;
  @Input() small = false;
  @Input() outlined = false;
  @Input() isDisabled = false;
  @Input() type = 'button';
  @Input() iconPosition: 'left' | 'right' = 'left';
}
