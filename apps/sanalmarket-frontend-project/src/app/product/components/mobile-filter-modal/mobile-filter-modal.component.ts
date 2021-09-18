import { Component, EventEmitter, Inject, Output, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';
import { MatSelectionListChange } from '@angular/material-experimental/mdc-list';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons';
import { faChevronRight, faTimes } from '@fortawesome/pro-solid-svg-icons';
import { AggregationGroup, SanalmarketAggregationInfo } from '@migroscomtr/sanalmarket-angular';

import { MobileFilterModalData, TypedAggregationInfo } from '../../../shared';

@Component({
  selector: 'sm-mobile-filter-modal',
  templateUrl: './mobile-filter-modal.component.html',
  styleUrls: ['./mobile-filter-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MobileFilterModalComponent {
  private _timesIcon = faTimes;
  private _chevronIcon = faChevronRight;
  private _backIcon = faArrowLeft;

  private _selectedGroup: AggregationGroup = null;
  private _selectedFilters: TypedAggregationInfo[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) private _data: MobileFilterModalData) {
    this._selectedFilters = this._data.selectedFilters ?? [];
  }

  @Output() filtersChanged = new EventEmitter<TypedAggregationInfo[]>();

  isGroupSelected(): boolean {
    return this._selectedGroup !== null;
  }

  isCheckboxSelected(type: string, info: SanalmarketAggregationInfo): boolean {
    return this._selectedFilters.some((f) => f.type === type && f.id === info.id);
  }

  isConfirmButtonDisabled(): boolean {
    return this._selectedFilters.length === 0;
  }

  getSelectedGroup(): AggregationGroup {
    return this._selectedGroup;
  }

  getTitle(): string {
    return this.isGroupSelected() ? this.getSelectedGroup().label : 'Filtrele';
  }

  getAggregationGroups(): AggregationGroup[] {
    return this._data.aggregationGroups;
  }

  getTimesIcon(): IconProp {
    return this._timesIcon;
  }

  getChevronIcon(): IconProp {
    return this._chevronIcon;
  }

  getBackIcon(): IconProp {
    return this._backIcon;
  }

  getProductCount(): number {
    if (this._selectedFilters.length === 0) {
      return this._data.totalCount;
    }
    return this._selectedFilters.reduce((prev, curr) => prev + curr.count, 0);
  }

  onClear(): void {
    this.filtersChanged.emit([]);
  }

  onConfirm(): void {
    this.filtersChanged.emit(this._selectedFilters);
  }

  onGroupChanged($event: MatSelectionListChange): void {
    this._selectedGroup = $event.options[0].value;
  }

  onBackButtonSelected(): void {
    this._selectedGroup = null;
  }

  onInfoChanged($event: MatSelectionListChange): void {
    const selectedInfo = $event.options[0].value as SanalmarketAggregationInfo;
    if ($event.options[0].selected) {
      this._selectedFilters = [...this._selectedFilters, { type: this._selectedGroup.type, ...selectedInfo }];
    } else {
      this._selectedFilters = this._selectedFilters.filter(
        (filter) => !(filter.type === this._selectedGroup.type && filter.id === selectedInfo.id)
      );
    }
  }

  getSelectedOptionLabelsByGroup(group: AggregationGroup): string {
    const label = this._selectedFilters
      .filter((f) => f.type === group.type)
      .map((f) => f.label)
      .reduce((prev, curr) => (prev.length ? `${prev},${curr}` : curr), '');
    if (label.length < 25) {
      return label;
    }
    return label.substring(0, 25).concat('...');
  }
}
