import { Location } from '@angular/common';
import { Component } from '@angular/core';

import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons';
import { IconDefinition } from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'sm-search-mobile',
  templateUrl: './search-mobile.component.html',
  styleUrls: ['./search-mobile.component.scss'],
})
export class SearchMobileComponent {
  arrowLeft: IconDefinition = faArrowLeft;

  constructor(private location: Location) {}

  onClickBackBtn(): void {
    this.location.back();
  }
}
