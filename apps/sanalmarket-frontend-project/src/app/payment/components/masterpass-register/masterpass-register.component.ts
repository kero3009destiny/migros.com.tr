import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import {
  MasterpassRegisterComponent,
  MasterpassService,
  MasterpassStateService,
} from '@fe-commerce/line-payment-masterpass';

@Component({
  selector: 'sm-masterpass-register',
  templateUrl: './masterpass-register.component.html',
  styleUrls: ['./masterpass-register.component.scss'],
})
export class SmMasterpassRegisterComponent extends MasterpassRegisterComponent implements OnInit, OnDestroy {
  constructor(
    agreementDialog: MatDialog,
    _masterpassService: MasterpassService,
    _masterpassStateService: MasterpassStateService,
    _formBuilder: FormBuilder
  ) {
    super(agreementDialog, _masterpassService, _masterpassStateService, _formBuilder);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  onChangeCheckbox(): void {
    this.registerAccepted = !this.registerAccepted;
  }

  isRegisterAccepted(): boolean {
    return this.registerAccepted;
  }
}
