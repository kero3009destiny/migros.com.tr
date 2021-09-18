import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { AddressOwnerModel, taxOfficeValidator } from '@fe-commerce/shared';

import { AddressInfoBean, City, District, Town, UserDTO } from '@migroscomtr/sanalmarket-angular';
import { Observable } from 'rxjs';

import { AddressDirective } from '../../directives';
import { AddressSubmitEventData } from '../../models';

@Component({
  selector: 'sm-corporate-invoice-address-form',
  templateUrl: './corporate-invoice-address-form.component.html',
  styleUrls: ['./corporate-invoice-address-form.component.scss'],
})
export class CorporateInvoiceAddressFormComponent extends AddressDirective {
  @Output() addressFormSubmit = new EventEmitter<AddressSubmitEventData>();
  @Output() closeEvent = new EventEmitter<void>();

  submitAddressForm(): void {
    this.addressFormSubmit.emit({
      formValues: this.addressFormGroup.value,
      isGoingToEdit: this.data.isGoingToEdit,
      id: this.data.address?.id ?? null,
      addressOwnerModel: AddressOwnerModel.CORPORATE,
    });
  }

  getCities$(): Observable<City[]> {
    return this._locationService.getCities();
  }

  getDistricts$(townId: number): Observable<District[]> {
    return this._locationService.getDistricts(townId);
  }

  getTowns$(cityId: number): Observable<Town[]> {
    return this._locationService.getTowns(cityId);
  }

  buildForm(address: AddressInfoBean, cityId: number, townId: number, districtId: number, streetId: number): FormGroup {
    return this._formBuilder.group({
      name: [
        address.name,
        [
          Validators.required,
          // not just numbers
          Validators.pattern(/(?!^\d+$)^.+$/),
        ],
      ],
      taxPayer: [address.taxPayer, [Validators.required]],
      taxOffice: [address.taxOffice, [Validators.required]],
      taxNumber: [
        address.taxNumber,
        [Validators.required, Validators.pattern('[0-9]{10}|[0-9]{11}'), taxOfficeValidator('taxNumber')],
      ],
      cityId: [cityId, [Validators.required]],
      townId: [{ value: townId, disabled: !cityId }, [Validators.required]],
      districtId: [{ value: districtId, disabled: !townId }, [Validators.required]],
      streetId: [{ value: streetId, disabled: !districtId }],
      detail: [address.detail, [Validators.required]],
      direction: [address.direction],
    });
  }

  buildFormWithoutLocation(user: UserDTO): FormGroup {
    return this._formBuilder.group({
      name: [
        null,
        [
          Validators.required,
          // not just numbers
          Validators.pattern(/(?!^\d+$)^.+$/),
        ],
      ],
      taxPayer: [null, [Validators.required]],
      taxOffice: [null, [Validators.required]],
      taxNumber: [
        null,
        [Validators.required, Validators.pattern('[0-9]{10}|[0-9]{11}'), taxOfficeValidator('taxNumber')],
      ],
      cityId: [null, [Validators.required]],
      townId: [{ value: null, disabled: true }, [Validators.required]],
      districtId: [{ value: null, disabled: true }, [Validators.required]],
      streetId: [{ value: null, disabled: true }],
      detail: [null, [Validators.required]],
      direction: [null],
    });
  }
}
