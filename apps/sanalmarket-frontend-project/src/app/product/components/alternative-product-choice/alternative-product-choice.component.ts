import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { AlternativeProductChoiceComponent, AlternativeProductChoiceValuesModel } from '@fe-commerce/shared';

import { CheckoutDTO } from '@migroscomtr/sanalmarket-angular';

export const CART_CHOICES: AlternativeProductChoiceValuesModel[] = [
  { value: 'UP_TO_CUSTOMER', label: 'Beni arayın', description: 'Ürünlerden biri bitmişse seni arayacağız' },
  { value: 'UP_TO_PERSONNEL', label: 'Benzerini getirin', description: 'Benzer ürün benzer marka' },
  {
    value: 'NO_ALTERNATIVE',
    label: 'Benzer ürün istemiyorum',
    description: 'Eksik olan ürünün iadesini yapacağız',
  },
];

@Component({
  selector: 'sm-alternative-product-choice',
  templateUrl: './alternative-product-choice.component.html',
  styleUrls: ['./alternative-product-choice.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SmAlternativeProductChoiceComponent extends AlternativeProductChoiceComponent implements OnInit {
  private _choice: CheckoutDTO.AlternativeProductChoiceEnum;

  ngOnInit(): void {
    this._choice = this.initialValue;
  }

  getCartChoices(): AlternativeProductChoiceValuesModel[] {
    return CART_CHOICES;
  }

  getTitle(): string {
    return this.title;
  }

  isSelected(choice: AlternativeProductChoiceValuesModel): boolean {
    return choice.value === this._choice;
  }

  onChangeCartChoice(alternativeProductChoice: CheckoutDTO.AlternativeProductChoiceEnum): void {
    this._choice = alternativeProductChoice;
    this.choiceChanged.emit(alternativeProductChoice);
  }
}
