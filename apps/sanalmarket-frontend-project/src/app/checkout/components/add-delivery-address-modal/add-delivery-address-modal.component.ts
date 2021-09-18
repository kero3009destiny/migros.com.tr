import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { AddressInfoBean, City, District, Town, UserDTO } from '@migroscomtr/sanalmarket-angular';
import { Observable } from 'rxjs';

import { AddressDirective } from '../../directives';
import { AddressSubmitEventData } from '../../models';

@Component({
  selector: 'sm-add-delivery-address-modal',
  templateUrl: './add-delivery-address-modal.component.html',
  styleUrls: ['./add-delivery-address-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddDeliveryAddressModalComponent extends AddressDirective {
  @Output() addressFormSubmit = new EventEmitter<AddressSubmitEventData>();
  @Output() closeEvent = new EventEmitter<void>();

  isSameAsDeliveryCheckboxVisible(): boolean {
    return !this.data.isGoingToEdit;
  }

  onClickCloseBtn(): void {
    this.closeEvent.emit();
  }

  submitAddressForm(): void {
    this.addressFormSubmit.emit({
      formValues: this.addressFormGroup.value,
      isGoingToEdit: this.data.isGoingToEdit,
      id: this.data.address?.id ?? null,
    });
  }

  getCities$(): Observable<City[]> {
    return this._locationService.getDeliverableCities();
  }

  getDistricts$(townId: number): Observable<District[]> {
    return this._locationService.getDeliverableDistricts(townId);
  }

  getTowns$(cityId: number): Observable<Town[]> {
    return this._locationService.getDeliverableTowns(cityId);
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
      saveAsInvoice: [true],
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
      saveAsInvoice: [true],
    });
  }
}
