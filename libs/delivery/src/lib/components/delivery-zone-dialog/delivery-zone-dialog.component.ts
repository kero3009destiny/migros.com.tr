import { Component, ElementRef, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material-experimental/mdc-dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { EnvService } from '@fe-commerce/env-service';
import { ServiceAreaObjectType } from '@fe-commerce/shared';

import { DeliveryZoneSelectFormComponent } from '../delivery-zone-select-form/delivery-zone-select-form.component';

@Component({
  selector: 'fe-delivery-zone-dialog',
  templateUrl: './delivery-zone-dialog.component.html',
  styleUrls: ['./delivery-zone-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeliveryZoneDialogComponent {
  @Output() deliveryZoneFormSubmit = new EventEmitter<{
    serviceAreaObjectId: number;
    serviceAreaObjectType: ServiceAreaObjectType;
  }>();
  @ViewChild('districtZoneForm', { static: false }) districtZoneSelectRef: DeliveryZoneSelectFormComponent;
  @ViewChild('pickpointZoneForm', { static: false }) pickpointZoneSelectRef: DeliveryZoneSelectFormComponent;

  private _selectedDeliveryType = ServiceAreaObjectType.DISTRICT;

  constructor(
    public dialogRef: MatDialogRef<DeliveryZoneDialogComponent>,
    private _element: ElementRef,
    private _envService: EnvService
  ) {}

  isPickPointTabVisible(): boolean {
    return !this._envService.hasDefaultDistrict;
  }

  onDismissClick(): void {
    this.dialogRef.close();
  }

  submitDeliveryZone(event: Event): void {
    const currentForm =
      this._selectedDeliveryType === ServiceAreaObjectType.DISTRICT
        ? this.districtZoneSelectRef
        : this.pickpointZoneSelectRef;
    currentForm.deliveryZoneForm.onSubmit(event);

    if (currentForm.deliveryZoneFormGroup.valid) {
      this.deliveryZoneFormSubmit.emit({
        serviceAreaObjectId: currentForm.serviceAreaObjectId.value,
        serviceAreaObjectType: this._selectedDeliveryType,
      });
    } else if (!currentForm.deliveryZoneFormGroup.valid) {
      this.scrollToInvalidFormField();
    }
  }

  private scrollToInvalidFormField(): void {
    const firstElementWithError = this._element.nativeElement.querySelectorAll('.ng-invalid');
    if (firstElementWithError) {
      firstElementWithError[0].scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }

  onDeliveryTabChange(event: MatTabChangeEvent): void {
    this._selectedDeliveryType = event.index === 0 ? ServiceAreaObjectType.DISTRICT : ServiceAreaObjectType.PICK_POINT;
  }

  getDistrictServiceAreaType(): ServiceAreaObjectType.DISTRICT {
    return ServiceAreaObjectType.DISTRICT;
  }

  getPickpointServiceAreaType(): ServiceAreaObjectType.PICK_POINT {
    return ServiceAreaObjectType.PICK_POINT;
  }
}
