import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material-experimental/mdc-checkbox';
import { Params } from '@angular/router';

import { AggregationGroup, SanalmarketAggregationInfo } from '@migroscomtr/sanalmarket-angular';

import { FilterChangedEvent, TypedAggregationInfo } from '../../../shared';

@Component({
  selector: 'sm-product-filters-desktop',
  templateUrl: './product-filters-desktop.component.html',
  styleUrls: ['./product-filters-desktop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFiltersDesktopComponent implements OnChanges {
  @Input() title: string;
  @Input() totalProductsCount: number;
  @Input() selectedFilters: TypedAggregationInfo[] = [];
  @Input() aggregationGroups: AggregationGroup[];
  @Input() isCategoryPage = false;

  @Output() filtersChanged = new EventEmitter<FilterChangedEvent>();

  private _subCategories: AggregationGroup;
  private _brands: AggregationGroup;
  private _discounts: AggregationGroup;
  private _attributes: AggregationGroup[];

  private _brandInfo: SanalmarketAggregationInfo[];

  constructor(private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.aggregationGroups) {
      const currentAgregationGroups: AggregationGroup[] = changes.aggregationGroups.currentValue;
      //
      this._subCategories = currentAgregationGroups.find((group) => group.type === 'CATEGORY');
      this._brands = currentAgregationGroups.find((group) => group.type === 'BRAND');
      this._discounts = currentAgregationGroups.find((group) => group.type === 'DISCOUNT');
      this._attributes = currentAgregationGroups.filter(
        (group) => group.type !== 'CATEGORY' && group.type !== 'BRAND' && group.type !== 'DISCOUNT'
      );
      //
      this._brandInfo = this._brands?.aggregationInfos ?? [];
    }
  }

  getSubCategories(): AggregationGroup {
    return this._subCategories;
  }

  getBrands(): AggregationGroup {
    return this._brands;
  }

  getBrandInfo(): SanalmarketAggregationInfo[] {
    return this._brandInfo;
  }

  getDiscounts(): AggregationGroup {
    return this._discounts;
  }

  getAttributes(): AggregationGroup[] {
    return this._attributes;
  }

  isChecked(id: string, type: string): boolean {
    return this.selectedFilters.some((filter) => filter.type === type && filter.id === id);
  }

  onFilterChanged(change: MatCheckboxChange, aggregationInfo: SanalmarketAggregationInfo, type: string): void {
    this.filtersChanged.emit({ checked: change.checked, type, aggregationInfo });
  }

  onBrandSearchKeyChanged($event: Event): void {
    this._brandInfo = this._brands.aggregationInfos.filter((info) =>
      // @ts-ignore
      info.label.toUpperCase().toLowerCase().startsWith($event.target.value.toUpperCase().toLowerCase())
    );
  }

  getSubCategoryParam(subCategory: SanalmarketAggregationInfo): Params {
    return { kategori: subCategory.requestParameter };
  }

  getUrl(): string {
    return location.pathname;
  }
}
