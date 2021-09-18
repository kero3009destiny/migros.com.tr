import { Component, Input } from '@angular/core';

import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-mobile-breadcrumb',
  templateUrl: './mobile-breadcrumb.component.html',
  styleUrls: ['./mobile-breadcrumb.component.scss'],
})
export class MobileBreadcrumbComponent {
  leftIcon = faArrowLeft;

  @Input() pageName: string;
}
