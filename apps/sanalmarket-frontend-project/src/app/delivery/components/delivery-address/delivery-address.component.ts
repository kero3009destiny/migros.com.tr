import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { UserService } from '@fe-commerce/core';
import { AddressService } from '@fe-commerce/delivery';
import { ServiceAreaObjectType, SubscriptionAbstract } from '@fe-commerce/shared';

import { distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';

import { AddressInfoBean } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-delivery-address',
  templateUrl: './delivery-address.component.html',
  styleUrls: ['./delivery-address.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeliveryAddressComponent extends SubscriptionAbstract implements OnInit {
  @Output() deliveryZoneChanged = new EventEmitter<{ districtId: number; type: ServiceAreaObjectType }>();

  private _addressList: AddressInfoBean[];

  constructor(
    private _userService: UserService,
    private _addressService: AddressService,
    private _changeDetectionRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this._getDeliveryAddressList();
  }

  getAddressList(): AddressInfoBean[] {
    return this._addressList;
  }

  submitDeliveryZone(address: AddressInfoBean): void {
    this.deliveryZoneChanged.emit({
      districtId: address.districtId,
      type: ServiceAreaObjectType.DISTRICT,
    });
  }

  private _getDeliveryAddressList(): void {
    this._userService.isAuthenticated$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        distinctUntilChanged(),
        filter((isAuthenticated) => isAuthenticated === true),
        switchMap(() => this._addressService.getDeliveryAddresses())
      )
      .subscribe((data) => {
        this._addressList = data;
        this._changeDetectionRef.markForCheck();
      });
    this._userService.isAuthenticated$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        distinctUntilChanged(),
        filter((isAuthenticated) => isAuthenticated === false)
      )
      .subscribe(() => {
        this._addressList = [];
        this._changeDetectionRef.markForCheck();
      });
  }
}
