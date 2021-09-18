import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-light-svg-icons';

import { MobileCampaignModalData } from '../../../shared';

@Component({
  selector: 'sm-mobile-campaign-detail',
  templateUrl: './mobile-campaign-detail.component.html',
  styleUrls: ['./mobile-campaign-detail.component.scss'],
})
export class MobileCampaignDetailComponent {
  private _timesIcon = faTimes;

  constructor(@Inject(MAT_DIALOG_DATA) private _data: MobileCampaignModalData) {}

  getTitle(): string {
    return this._data.title;
  }

  getContent(): string {
    return this._data.content;
  }

  getTimesIcon(): IconProp {
    return this._timesIcon;
  }
}
