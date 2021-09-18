import { Component, Input } from '@angular/core';

import { Breadcrumb } from '@migroscomtr/sanalmarket-angular';

import { BreadcrumbModel } from '../../models';

@Component({
  selector: 'fe-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  skeletonItems = Array(2).fill(null);
  @Input() breadcrumbs: Array<BreadcrumbModel> | Breadcrumb[] = [];

  trackByFn(_index, item) {
    return item.label;
  }
}
