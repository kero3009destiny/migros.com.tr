import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { MasterpassService } from '../../services/masterpass.service';
import { extractInputsFromNodeList } from '../../utils';

@Component({
  selector: 'fe-masterpass-purchase',
  templateUrl: './masterpass-purchase.component.html',
  styleUrls: ['./masterpass-purchase.component.scss'],
})
export class MasterpassPurchaseComponent implements AfterViewInit {
  @ViewChild('purchaseForm') purchaseForm: ElementRef<HTMLFormElement>;

  constructor(private _masterpassService: MasterpassService) {}

  ngAfterViewInit(): void {
    const purchaseInputs = extractInputsFromNodeList(this.purchaseForm);
    this._masterpassService.updatePurchaseInputs(purchaseInputs);
  }
}
