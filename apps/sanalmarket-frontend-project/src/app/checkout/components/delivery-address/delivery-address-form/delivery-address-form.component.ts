import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { faTimesCircle, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

import { AnonymousCheckoutForm, FormStatus, ServiceAreaObjectType, StreetOption } from '../../../../shared/models';

@Component({
  selector: 'sm-delivery-address-form',
  templateUrl: './delivery-address-form.component.html',
  styleUrls: ['./delivery-address-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryAddressFormComponent implements OnInit {
  @Input() streetsMap: StreetOption[];
  @Input() serviceAreaObjectType: ServiceAreaObjectType;

  @Output() formValueChange: EventEmitter<AnonymousCheckoutForm> = new EventEmitter<AnonymousCheckoutForm>();
  @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();

  anonymousCheckoutFormGroup: FormGroup;
  clearIcon: IconDefinition = faTimesCircle;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.anonymousCheckoutFormGroup = this._initializeForm();
    this.subscribeOnFormChanges();
  }

  private subscribeOnFormChanges() {
    this.anonymousCheckoutFormGroup.valueChanges.subscribe((formValue) => {
      this.formValueChange.emit(formValue);
    });
    this.anonymousCheckoutFormGroup.statusChanges.subscribe((formStatus) => {
      this.formStatusChange.emit(formStatus);
    });
  }

  private _initializeForm() {
    const anonymousUserInfoFieldsConfig = {
      name: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      surname: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: [null, [Validators.required, Validators.email]],
      phoneNumber: [null, [Validators.required, Validators.pattern(/^5[0-9]{9}$/)]],
    };

    const districtAddressDetailFieldsConfig = {
      street: [null],
      doorNumber: [null, [Validators.required]],
      fullAddress: [null, [Validators.maxLength(250)]],
    };
    if (this.addDistrictAddressDetailFields) {
      return this._formBuilder.group({ ...anonymousUserInfoFieldsConfig, ...districtAddressDetailFieldsConfig });
    }

    return this._formBuilder.group(anonymousUserInfoFieldsConfig);
  }

  get addDistrictAddressDetailFields() {
    return !this.serviceAreaObjectType || this.serviceAreaObjectType === ServiceAreaObjectType.DISTRICT;
  }

  get phoneNumber() {
    return this.anonymousCheckoutFormGroup.get('phoneNumber');
  }

  clear(field: string) {
    this.anonymousCheckoutFormGroup.get(field).setValue(null);
  }
}
