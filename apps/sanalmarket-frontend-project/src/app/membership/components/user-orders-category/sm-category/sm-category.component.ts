import { Component, Input } from '@angular/core';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-solid-svg-icons';
import { CategorizedOrderItemInfos } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-category',
  templateUrl: './sm-category.component.html',
  styleUrls: ['./sm-category.component.scss'],
})
export class SmCategoryComponent {
  // INPUTS
  @Input() category: CategorizedOrderItemInfos;

  // ICONS
  plusIcon: IconDefinition = faPlus;
  chevronDownIcon: IconDefinition = faChevronDown;
  chevronUpIcon: IconDefinition = faChevronUp;

  // STATES
  private _isOpen = true;

  isComponentVisible(): boolean {
    return !!this.category;
  }

  isOpen(): boolean {
    return this._isOpen;
  }

  getIcon(): IconDefinition {
    return this.isOpen() ? this.chevronUpIcon : this.chevronDownIcon;
  }

  toggle(): void {
    this._isOpen = !this._isOpen;
  }
}
