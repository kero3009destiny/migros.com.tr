import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { AlternativeProductChoiceValuesModel } from '@fe-commerce/shared';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-solid-svg-icons';
import { CheckoutDTO } from '@migroscomtr/sanalmarket-angular';

import { CART_CHOICES } from '../alternative-product-choice/alternative-product-choice.component';

@Component({
  selector: 'sm-product-alternative-product-choice-dialog',
  templateUrl: './alternative-product-choice-dialog.component.html',
  styleUrls: ['./alternative-product-choice-dialog.component.scss'],
})
export class AlternativeProductChoiceDialogComponent {
  private _timesIcon = faTimes;
  private _noAlternativeChoiceValue: CheckoutDTO.AlternativeProductChoiceEnum = 'NO_ALTERNATIVE';

  constructor(@Inject(MAT_DIALOG_DATA) private data: CheckoutDTO.AlternativeProductChoiceEnum) {}

  getTimesIcon(): IconProp {
    return this._timesIcon;
  }

  getNoAlternativeChoiceValue(): CheckoutDTO.AlternativeProductChoiceEnum {
    return this._noAlternativeChoiceValue;
  }

  getCartChoices(): AlternativeProductChoiceValuesModel[] {
    return CART_CHOICES.filter((cartChoice) => cartChoice.value !== this._noAlternativeChoiceValue);
  }

  isSelected(choice: AlternativeProductChoiceValuesModel): boolean {
    return choice.value === this.data;
  }
}
