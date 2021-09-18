import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoadingIndicatorService, LoggingService, UserService } from '@fe-commerce/core';
import { DeliveryZoneService } from '@fe-commerce/delivery';
import { ServiceAreaObjectType, SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { City, LocationRestControllerService, PickPoint, Town } from '@migroscomtr/sanalmarket-angular';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'sm-delivery-store',
  templateUrl: './delivery-store.component.html',
  styleUrls: ['./delivery-store.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeliveryStoreComponent extends SubscriptionAbstract implements OnInit, AfterViewInit {
  @Output() deliveryZoneChanged = new EventEmitter<{ districtId: number; type: ServiceAreaObjectType }>();

  cities: City[] = [];
  towns: Town[] = [];
  pickPoints: PickPoint[] = [];

  deliveryStoreFormGroup: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _locationService: LocationRestControllerService,
    private _deliveryZoneService: DeliveryZoneService,
    private _userService: UserService,
    private _loggingService: LoggingService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {
    super();
  }

  ngOnInit(): void {
    this.buildForm();
    this.getCities();
  }

  ngAfterViewInit(): void {
    this.subscribeToLocationChangeHandlers();
  }

  getCities(): void {
    this._loadingIndicatorService.start();
    this._locationService
      .getDeliverableCities(ServiceAreaObjectType.PICK_POINT)
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

  subscribeToLocationChangeHandlers(): void {
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
          this._locationService.getDeliverableTowns(city.id, ServiceAreaObjectType.PICK_POINT).pipe(
            catchError((error) => {
              this._loggingService.logError({ title: 'Hata', message: error });
              return EMPTY;
            }),
            map((response) => response.data)
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
          this._locationService.getDeliverablePickPoints(town.id).pipe(
            map((response) => response.data),
            catchError((error) => {
              this._loggingService.logError({ title: 'Hata', message: error });
              return EMPTY;
            })
          )
        )
      )
      .subscribe((pickPoints) => {
        this.getServiceAreaObjectId().enable();
        this.pickPoints = pickPoints;
      });
  }

  getCityId(): AbstractControl {
    return this.deliveryStoreFormGroup.get('cityId');
  }

  getServiceAreaObjectId(): AbstractControl {
    return this.deliveryStoreFormGroup.get('serviceAreaObjectId');
  }

  getTownId(): AbstractControl {
    return this.deliveryStoreFormGroup.get('townId');
  }

  isTownDisabled(): boolean {
    return this.getTownId().disabled;
  }

  isDistrictDisabled(): boolean {
    return this.getServiceAreaObjectId().disabled;
  }

  submitDeliveryZone(event: Event): void {
    if (this.deliveryStoreFormGroup.valid && event) {
      this.deliveryZoneChanged.emit({
        districtId: this.getServiceAreaObjectId().value.id,
        type: ServiceAreaObjectType.PICK_POINT,
      });
    }
  }

  private buildForm(): void {
    this.deliveryStoreFormGroup = this._formBuilder.group({
      cityId: [{ value: null, disabled: false }, [Validators.required]],
      townId: [{ value: null, disabled: true }, [Validators.required]],
      serviceAreaObjectId: [{ value: null, disabled: true }, [Validators.required]],
    });
  }
}
