import { Component, Input } from '@angular/core';

import { MoneyTransferStepsModel } from '../money-transfer';

@Component({
  selector: 'sm-money-transfer-steps',
  templateUrl: './money-transfer-steps.component.html',
  styleUrls: ['./money-transfer-steps.component.scss'],
})
export class MoneyTransferStepsComponent {
  @Input() stepsTitle: string;
  @Input() stepList: MoneyTransferStepsModel[];
}
