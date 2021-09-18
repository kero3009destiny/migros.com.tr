import { Component, Input } from '@angular/core';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-side-nav-link',
  templateUrl: './side-nav-link.component.html',
  styleUrls: ['./side-nav-link.component.scss'],
})
export class SideNavLinkComponent {
  @Input() linkIcon: IconDefinition;
  @Input() linkTitle: string;
  @Input() linkDetail: string;
  chevronRightIcon: IconDefinition = faChevronRight;

  getLinkTitle(): string {
    return this.linkTitle;
  }

  getLinkDetail(): string {
    return this.linkDetail;
  }
}
