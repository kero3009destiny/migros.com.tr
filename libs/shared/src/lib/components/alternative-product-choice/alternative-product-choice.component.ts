import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';

import { CheckoutDTO } from '@migroscomtr/sanalmarket-angular';

import { AlternativeProductChoiceValuesModel } from '../../models';

@Component({
  selector: 'fe-alternative-product-choice',
  templateUrl: './alternative-product-choice.component.html',
  styleUrls: ['./alternative-product-choice.component.scss'],
})
export class AlternativeProductChoiceComponent {
  @Input() title: string;
  @Input() initialValue: CheckoutDTO.AlternativeProductChoiceEnum;
  @Output() choiceChanged: EventEmitter<CheckoutDTO.AlternativeProductChoiceEnum> = new EventEmitter();

  cartChoices: AlternativeProductChoiceValuesModel[] = [
    { value: 'UP_TO_PERSONNEL', label: 'Alternatifi benim yerime siz seçin' },
    { value: 'NO_ALTERNATIVE', label: 'Alternatif istemiyorum' },
    { value: 'UP_TO_CUSTOMER', label: 'Alternatif için beni arayın' },
  ];

  onCartChoiceChange(event: MatRadioChange): void {
    this.choiceChanged.emit(event.value as CheckoutDTO.AlternativeProductChoiceEnum);
  }
}
