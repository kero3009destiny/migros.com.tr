import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { AddressOwnerModel } from '@fe-commerce/shared';

import { AddressInfoBean, City, District, Town, UserDTO } from '@migroscomtr/sanalmarket-angular';
import { Observable } from 'rxjs';

import { AddressDirective } from '../../directives';
import { AddressSubmitEventData } from '../../models';

@Component({
  selector: 'sm-personal-invoice-address-form',
  templateUrl: './personal-invoice-address-form.component.html',
  styleUrls: ['./personal-invoice-address-form.component.scss'],
})
export class PersonalInvoiceAddressFormComponent extends AddressDirective {
  @Output() addressFormSubmit = new EventEmitter<AddressSubmitEventData>();
  @Output() closeEvent = new EventEmitter<void>();

  submitPersonalAddressForm(): void {
    this.addressFormSubmit.emit({
      formValues: this.addressFormGroup.value,
      isGoingToEdit: this.data.isGoingToEdit,
      id: this.data.address?.id ?? null,
      addressOwnerModel: AddressOwnerModel.PERSONAL,
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
      firstName: [address.firstName, [Validators.required]],
      lastName: [address.lastName, [Validators.required]],
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
      firstName: [user.firstName, [Validators.required]],
      lastName: [user.lastName, [Validators.required]],
      cityId: [null, [Validators.required]],
      townId: [{ value: null, disabled: true }, [Validators.required]],
      districtId: [{ value: null, disabled: true }, [Validators.required]],
      streetId: [{ value: null, disabled: true }],
      detail: [null, [Validators.required]],
      direction: [null],
    });
  }
}
