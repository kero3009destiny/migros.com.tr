import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { UserService } from '@fe-commerce/core';
import { LocationService } from '@fe-commerce/delivery';
import { AddressOwnerModel, SubscriptionAbstract, TabModel } from '@fe-commerce/shared';

import { faTimes } from '@fortawesome/pro-regular-svg-icons';

import { AddressSubmitEventData, DeliveryAddressModalData } from '../../models';

@Component({
  selector: 'sm-add-invoice-address-modal',
  templateUrl: './add-invoice-address-modal.component.html',
  styleUrls: ['./add-invoice-address-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddInvoiceAddressModalComponent extends SubscriptionAbstract implements OnInit {
  @Output() addressFormSubmit = new EventEmitter<AddressSubmitEventData>();
  @Output() closeEvent = new EventEmitter<void>();

  closeIcon = faTimes;
  isScrolledToBottom = false;

  readonly PERSONAL_TAB: TabModel = { label: 'Bireysel' };
  readonly CORPORATE_TAB: TabModel = { label: 'Kurumsal' };

  private tabFormControl = new FormControl(null);

  constructor(
    private _formBuilder: FormBuilder,
    private _locationService: LocationService,
    private _userService: UserService,
    @Inject(MAT_DIALOG_DATA) private data: DeliveryAddressModalData,
    private _changeDetectionRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this._initialize();
  }

  getFormState(): number {
    return this.tabFormControl.value;
  }

  isPersonalInvoiceTabVisible(): boolean {
    if (!this.data.isGoingToEdit) {
      return true;
    }
    return this.tabFormControl.value === 0;
  }

  isCorporateInvoiceTabVisible(): boolean {
    if (!this.data.isGoingToEdit) {
      return true;
    }
    return this.tabFormControl.value === 1;
  }

  onClickCloseBtn(): void {
    this.closeEvent.emit();
  }

  onTabSelected(): void {
    this.isScrolledToBottom = false;
  }

  submitCorporateAddressForm(addressSubmitEventData: AddressSubmitEventData): void {
    this.addressFormSubmit.emit({
      ...addressSubmitEventData,
      addressOwnerModel: AddressOwnerModel.CORPORATE,
    });
  }

  submitPersonalAddressForm(addressSubmitEventData: AddressSubmitEventData): void {
    this.addressFormSubmit.emit({
      ...addressSubmitEventData,
      addressOwnerModel: AddressOwnerModel.PERSONAL,
    });
  }

  private _initialize(): void {
    if (this.data.isGoingToEdit) {
      this.tabFormControl.patchValue(this.data.address.taxOffice ? 1 : 0);
      return;
    }
    this.tabFormControl.patchValue(0);
  }
}
