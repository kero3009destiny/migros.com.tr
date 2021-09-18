import { ChangeDetectorRef, Directive, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { UserService } from '@fe-commerce/core';
import { LocationService } from '@fe-commerce/delivery';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, filter, map, switchMap, takeUntil } from 'rxjs/operators';

import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { AddressInfoBean, City, District, Street, Town, UserDTO } from '@migroscomtr/sanalmarket-angular';
import { combineLatest, Observable, throwError } from 'rxjs';

import { DeliveryAddressModalData } from '../models';

@Directive({ selector: '[smAddress]' })
export abstract class AddressDirective extends SubscriptionAbstract implements OnInit {
  addressFormGroup: FormGroup;
  closeIcon = faTimes;

  private _cities: City[];
  private _towns: Town[];
  private _districts: District[];
  private _streets: Street[];

  constructor(
    protected _locationService: LocationService,
    @Inject(MAT_DIALOG_DATA) protected data: DeliveryAddressModalData,
    protected _formBuilder: FormBuilder,
    private _userService: UserService,
    private _changeDetectionRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this._initialize();
  }

  getCities(): City[] {
    return this._cities;
  }

  getTowns(): Town[] {
    return this._towns;
  }

  getDistricts(): District[] {
    return this._districts;
  }

  getStreets(): Street[] {
    return this._streets;
  }

  private getCityControl(): AbstractControl {
    return this.addressFormGroup.get('cityId');
  }

  private getTownControl(): AbstractControl {
    return this.addressFormGroup.get('townId');
  }

  private getDistrictControl(): AbstractControl {
    return this.addressFormGroup.get('districtId');
  }

  private getStreetControl(): AbstractControl {
    return this.addressFormGroup.get('streetId');
  }

  private _initialize(): void {
    if (this.data.address) {
      this._fillForm(this.data.address);
      return;
    }
    // has location
    combineLatest([
      this._locationService.getLocationInfo$().pipe(
        map((location) => location?.serviceAreaObjectId),
        filter(
          (districtId) =>
            !!districtId &&
            !this._locationService.isDeliveryFoundation() &&
            !this._locationService.isDeliveryPickPoint()
        ),
        switchMap((districtId) => this._locationService.getLocationInfoByDistrictId(districtId))
      ),
      this._userService.user$,
    ])
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(([locationInfo, user]) => {
        this._fillForm({ ...locationInfo, firstName: user.firstName, lastName: user.lastName });
      });
    // has no location
    combineLatest([
      this._locationService.getLocationInfo$().pipe(
        map((location) => location?.serviceAreaObjectId),
        filter(
          (districtId) =>
            !districtId || this._locationService.isDeliveryFoundation() || this._locationService.isDeliveryPickPoint()
        ),
        switchMap(() => this.getCities$())
      ),
      this._userService.user$,
    ])
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(([cities, user]) => {
        this._cities = cities;
        this._fillFormWithoutLocation(user);
      });
  }

  private _fillForm(address: AddressInfoBean): void {
    const {
      city: { id: cityId = null } = {},
      town: { id: townId = null } = {},
      district: { id: districtId = null } = {},
      street: { id: streetId = null } = {},
    } = address;
    combineLatest([
      this.getCities$(),
      this.getTowns$(cityId),
      this.getDistricts$(townId),
      this._locationService.getStreets(districtId),
    ])
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => throwError(error))
      )
      .subscribe(([cities, towns, districts, streets]) => {
        this._cities = cities;
        this._towns = towns;
        this._districts = districts;
        this._streets = streets;
        //
        this.addressFormGroup = this.buildForm(address, cityId, townId, districtId, streetId);
        //
        this._subscribeToLocationChangeHandlers();
        this._changeDetectionRef.markForCheck();
      });
  }

  private _fillFormWithoutLocation(user: UserDTO): void {
    this.addressFormGroup = this.buildFormWithoutLocation(user);
    //
    this._subscribeToLocationChangeHandlers();
    this._changeDetectionRef.markForCheck();
  }

  private _subscribeToLocationChangeHandlers(): void {
    this.getCityControl()
      .valueChanges.pipe(
        takeUntil(this.getDestroyInterceptor()),
        map((value) => Number.parseInt(value, 10))
      )
      .subscribe((cityId) => {
        this._cityChangeHandler(cityId);
      });

    this.getTownControl()
      .valueChanges.pipe(
        takeUntil(this.getDestroyInterceptor()),
        map((value) => Number.parseInt(value, 10))
      )
      .subscribe((townId) => {
        this._townChangeHandler(townId);
      });

    this.getDistrictControl()
      .valueChanges.pipe(
        takeUntil(this.getDestroyInterceptor()),
        map((value) => Number.parseInt(value, 10))
      )
      .subscribe((districtId) => {
        this._districtChangeHandler(districtId);
      });
  }

  private _cityChangeHandler(cityId: number): void {
    this.getTownControl().reset();
    this.getTownControl().disable();
    this._towns = [];
    //
    this.getDistrictControl().reset();
    this.getDistrictControl().disable();
    this._districts = [];
    //
    this.getStreetControl().reset();
    this.getStreetControl().disable();
    this._streets = [];
    //
    if (!Number.isSafeInteger(cityId)) {
      this.getCityControl().setValue(null, { emitEvent: false });
      return;
    }
    if (cityId) {
      this.getTowns$(Number(cityId)).subscribe((towns) => {
        this._towns = towns;
        this.getTownControl().enable();
      });
    }
  }

  private _townChangeHandler(townId: number): void {
    this.getDistrictControl().reset();
    this.getDistrictControl().disable();
    this._districts = [];
    //
    this.getStreetControl().reset();
    this.getStreetControl().disable();
    this._streets = [];
    //
    if (!Number.isSafeInteger(townId)) {
      this.getTownControl().setValue(null, { emitEvent: false });
      return;
    }
    if (townId) {
      this.getDistricts$(townId).subscribe((districts) => {
        this._districts = districts;
        this.getDistrictControl().enable();
      });
    }
  }

  private _districtChangeHandler(districtId: number): void {
    this.getStreetControl().reset();
    this.getStreetControl().disable();
    this._streets = [];
    //
    if (!Number.isSafeInteger(districtId)) {
      this.getDistrictControl().setValue(null, { emitEvent: false });
      return;
    }
    //
    if (districtId) {
      this._locationService.getStreets(districtId).subscribe((streets) => {
        this._streets = streets;
        this.getStreetControl().enable();
      });
    }
  }

  abstract getCities$(): Observable<City[]>;

  abstract getTowns$(cityId: number): Observable<Town[]>;

  abstract getDistricts$(townId: number): Observable<District[]>;

  abstract buildForm(
    address: AddressInfoBean,
    cityId: number,
    townId: number,
    districtId: number,
    streetId: number
  ): FormGroup;

  abstract buildFormWithoutLocation(user: UserDTO): FormGroup;
}
