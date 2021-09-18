import { Component, Input } from '@angular/core';

import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-legal-description',
  templateUrl: './legal-description.component.html',
  styleUrls: ['./legal-description.component.scss'],
})
export class LegalDescriptionComponent {
  @Input() description: string;

  icon = faInfoCircle;
}
