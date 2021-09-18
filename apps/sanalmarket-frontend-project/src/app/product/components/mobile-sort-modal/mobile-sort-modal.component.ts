import { Component, EventEmitter, Inject, Output, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';
import { MatRadioChange } from '@angular/material/radio';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-solid-svg-icons';

import { MobileSortModalData, SortCriteriaOption } from '../../../shared';

@Component({
  selector: 'sm-mobile-sort-modal',
  templateUrl: './mobile-sort-modal.component.html',
  styleUrls: ['./mobile-sort-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MobileSortModalComponent {
  private _timesIcon = faTimes;
  private _selectedOption = this._data.initialOption;

  constructor(@Inject(MAT_DIALOG_DATA) private _data: MobileSortModalData) {}

  @Output() sortCriteriaConfirmed = new EventEmitter<SortCriteriaOption>();

  getSortCriteriaOptions(): SortCriteriaOption[] {
    return this._data.sortCriteriaOptions;
  }

  getInitialOption(): SortCriteriaOption {
    return this._data.initialOption;
  }

  getTimesIcon(): IconProp {
    return this._timesIcon;
  }

  onSortCriteriaChange($event: MatRadioChange): void {
    this._selectedOption = $event.value;
  }

  onConfirm(): void {
    this.sortCriteriaConfirmed.emit(this._selectedOption);
  }
}
