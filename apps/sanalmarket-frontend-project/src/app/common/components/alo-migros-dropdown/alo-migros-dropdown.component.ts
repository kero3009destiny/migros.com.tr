import { Component, EventEmitter, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { Subscription } from 'rxjs';

import { AloMigrosData } from '../alo-migros';
import { AloMigrosPhoneComponent } from '../alo-migros-phone/alo-migros-phone.component';

class Store {
  storeName: string;
  storePhoneNumber: string;
}

@Component({
  selector: 'sm-alo-migros-dropdown',
  templateUrl: './alo-migros-dropdown.component.html',
  styleUrls: ['./alo-migros-dropdown.component.scss'],
})
export class AloMigrosDropdownComponent implements OnInit, OnDestroy, OnChanges {
  @Output() storeName = new EventEmitter<string>();
  @Output() storePhoneNumber = new EventEmitter<string>();
  @Output() storeAddress = new EventEmitter<string>();
  @Output() storeInfo = new EventEmitter<Store>();
  name;
  phoneNumber;
  address;
  deliveryFormGroup: FormGroup;
  cities = AloMigrosData.map((city) => city);
  towns = [];
  stores = [];
  isTownDisabled = true;
  isStoreDisabled = true;

  private _subscription = new Subscription();

  constructor(private _formBuilder: FormBuilder, public dialog: MatDialog) {}

  ngOnInit() {
    this.buildForm();
  }
  ngOnChanges(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  changeCity(event) {
    this.townId.reset();
    this.townId.enable();
    this.towns = event?.towns;
    this.isTownDisabled = false;

    this.storeId.reset();
    this.storeId.enable();
    this.stores = [{ storeName: '', storePhoneNumber: '' }];
    this.isStoreDisabled = false;
  }

  changeTown(event) {
    this.storeId.reset();
    this.storeId.enable();
    this.stores = event?.stores;
    this.isStoreDisabled = false;
  }

  changeStore(event) {
    this.phoneNumber = event?.phone_number;
    this.name = event?.name;
    this.address = event?.address;
  }

  private buildForm() {
    this.deliveryFormGroup = this._formBuilder.group({
      cityId: [{ value: null, disabled: false }, [Validators.required]],
      townId: [{ value: null, disabled: true }, [Validators.required]],
      storeId: [{ value: null, disabled: true }, [Validators.required]],
    });
  }

  get cityId() {
    return this.deliveryFormGroup.get('cityId');
  }

  get storeId() {
    return this.deliveryFormGroup.get('storeId');
  }

  get townId() {
    return this.deliveryFormGroup.get('townId');
  }

  submitDeliveryZone() {
    this.dialog.open(AloMigrosPhoneComponent, {
      closeOnNavigation: true,
      disableClose: true,
      panelClass: ['alo-migros-phone-modal__container', 'wide-dialog'],
      id: 'alo-migros-phone-modal-component',
      data: {
        storeName: this.name,
        storePhoneNumber: this.phoneNumber,
        storeAddress: this.address,
      },
    });
  }
}
