import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { MasterpassService } from '../../services/masterpass.service';
import { extractInputsFromNodeList } from '../../utils';

@Component({
  selector: 'fe-masterpass-check-user',
  templateUrl: './masterpass-check-user.component.html',
  styleUrls: ['./masterpass-check-user.component.scss'],
})
export class MasterpassCheckUserComponent implements AfterViewInit {
  @ViewChild('checkMasterpassForm') checkForm: ElementRef<HTMLFormElement>;

  constructor(private _masterpassService: MasterpassService) {}

  ngAfterViewInit(): void {
    const checkInputs = extractInputsFromNodeList(this.checkForm);
    this._masterpassService.authenticate(checkInputs);
  }
}
