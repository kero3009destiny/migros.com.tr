import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoadingIndicatorService, LoggingService } from '@fe-commerce/core';
import { AddressService, DeliveryZoneService } from '@fe-commerce/delivery';
import { ServiceAreaObjectType, SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { City, District, LocationRestControllerService, Town } from '@migroscomtr/sanalmarket-angular';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'sm-delivery-address-dropdown',
  templateUrl: './delivery-address-dropdown.component.html',
  styleUrls: ['./delivery-address-dropdown.component.scss'],
})
export class DeliveryAddressDropdownComponent extends SubscriptionAbstract implements OnInit, AfterViewInit {
  @Output() deliveryZoneChanged = new EventEmitter<{ districtId: number; type: ServiceAreaObjectType }>();

  cities: City[] = [];
  towns: Town[] = [];
  districts: District[] = [];
  deliveryZoneFormGroup: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _locationService: LocationRestControllerService,
    private _deliveryZoneService: DeliveryZoneService,
    private _loggingService: LoggingService,
    private _addressService: AddressService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {
    super();
  }

  ngOnInit(): void {
    this.buildForm();
    this.fetchCities();
  }

  ngAfterViewInit(): void {
    this.subscribeToLocationChangeHandlers();
  }

  getCityId(): AbstractControl {
    return this.deliveryZoneFormGroup.get('cityId');
  }

  getTownId(): AbstractControl {
    return this.deliveryZoneFormGroup.get('townId');
  }
  getServiceAreaObjectId(): AbstractControl {
    return this.deliveryZoneFormGroup.get('serviceAreaObjectId');
  }

  isTownDisabled(): boolean {
    return this.getTownId().disabled;
  }

  isDistrictDisabled(): boolean {
    return this.getServiceAreaObjectId().disabled;
  }

  submitDeliveryZone(): void {
    const district = this.getServiceAreaObjectId().value;
    if (district) {
      this.deliveryZoneChanged.emit({
        districtId: district.id,
        type: ServiceAreaObjectType.DISTRICT,
      });
    }
  }

  private fetchCities(): void {
    this._loadingIndicatorService.start();
    this._locationService
      .getDeliverableCities(ServiceAreaObjectType.DISTRICT)
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        map((response) => response.data),
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        })
      )
      .subscribe((cities) => {
        this.cities = cities;
      });
    this._loadingIndicatorService.stop();
  }

  private subscribeToLocationChangeHandlers(): void {
    this.getCityId()
      .valueChanges.pipe(
        takeUntil(this.getDestroyInterceptor()),
        distinctUntilChanged(),
        tap(() => {
          this.getTownId().reset();
          this.getTownId().disable();
          //
          this.getServiceAreaObjectId().reset();
          this.getServiceAreaObjectId().disable();
        }),
        filter((city) => !!city),
        switchMap((city) =>
          this._locationService.getDeliverableTowns(city.id, ServiceAreaObjectType.DISTRICT).pipe(
            map((response) => response.data),
            catchError((error) => {
              this._loggingService.logError({ title: 'Hata', message: error });
              return EMPTY;
            })
          )
        )
      )
      .subscribe((towns) => {
        this.getTownId().enable();
        this.towns = towns;
      });

    this.getTownId()
      .valueChanges.pipe(
        takeUntil(this.getDestroyInterceptor()),
        distinctUntilChanged(),
        tap(() => {
          this.getServiceAreaObjectId().reset();
          this.getServiceAreaObjectId().disable();
        }),
        filter((town) => !!town),
        switchMap((town) =>
          this._locationService.getDeliverableDistricts(town.id).pipe(
            map((response) => response.data),
            catchError((error) => {
              this._loggingService.logError({ title: 'Hata', message: error });
              return EMPTY;
            })
          )
        )
      )
      .subscribe((districts) => {
        this.getServiceAreaObjectId().enable();
        this.districts = districts;
      });
  }

  private buildForm(): void {
    this.deliveryZoneFormGroup = this._formBuilder.group({
      cityId: [{ value: null, disabled: false }, [Validators.required]],
      townId: [{ value: null, disabled: true }, [Validators.required]],
      serviceAreaObjectId: [{ value: null, disabled: true }, [Validators.required]],
    });
  }
}
