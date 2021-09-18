import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';

import { Observable } from 'rxjs';
import { InstallmentInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { CardInfoService } from '../../services';

@Component({
  selector: 'fe-commerce-card-installment-form',
  templateUrl: './card-installment-form.component.html',
  styleUrls: ['./card-installment-form.component.scss'],
})
export class CardInstallmentFormComponent {
  readonly TITLE = 'Kartına uygun taksit seçeneğini seçebilirsin';

  @Input() revenue: number;

  @Output() installmentChanged = new EventEmitter<number>();

  constructor(private _cardInfoService: CardInfoService) {}

  get title() {
    return this.TITLE;
  }

  get installmentInfo$(): Observable<InstallmentInfoDTO> {
    return this._cardInfoService.installmentInfo$;
  }

  installmentSelected($event: MatRadioChange) {
    this.installmentChanged.emit($event.value);
  }
}
