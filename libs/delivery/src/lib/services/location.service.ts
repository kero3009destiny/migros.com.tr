import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { LoadingIndicatorService, LoggingService, UserService } from '@fe-commerce/core';
import { DeliveryModel } from '@fe-commerce/line-checkout';
import { DetailedLocationInfo, ServiceAreaObjectType, SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, filter, finalize, first, map, switchMap, takeUntil } from 'rxjs/operators';

import { EMPTY, Observable } from 'rxjs';
import {
  City,
  District,
  LocationInfo,
  LocationInfo1,
  LocationRestControllerService,
  ServiceResponseListCity,
  Street,
  Town,
} from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class LocationService extends SubscriptionAbstract {
  private locationInfo: LocationInfo1;

  constructor(
    private _userService: UserService,
    public _formBuilder: FormBuilder,
    public _loggingService: LoggingService,
    public locationRestControllerService: LocationRestControllerService,
    public _loadingIndicatorService: LoadingIndicatorService
  ) {
    super();
    this._userService.locationInfo$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((locationInfo) => {
      this.locationInfo = locationInfo;
    });
  }

  getLocationInfo$(): Observable<DetailedLocationInfo> {
    return this._userService.locationInfo$;
  }

  isDeliveryShipment(): boolean {
    return this.locationInfo.storeDeliveryModel === DeliveryModel.SHIPMENT;
  }

  isDeliveryLastMile(): boolean {
    return (
      this.locationInfo.storeDeliveryModel === DeliveryModel.LAST_MILE &&
      !this.isDeliveryPickPoint() &&
      !this.isDeliveryFoundation()
    );
  }

  isDeliveryFoundation(): boolean {
    return this.locationInfo.serviceAreaObjectType === ServiceAreaObjectType.FOUNDATION;
  }

  isDeliveryPickPoint(): boolean {
    return this.locationInfo.serviceAreaObjectType === ServiceAreaObjectType.PICK_POINT;
  }

  isDeliveryTypeSelected(): boolean {
    return Object.prototype.hasOwnProperty.call(this.locationInfo, 'serviceAreaObjectId');
  }

  getCities(): Observable<City[]> {
    this._loadingIndicatorService.start();
    return this.locationRestControllerService.getCities1().pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      takeUntil(this.getDestroyInterceptor()),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  getDeliverableCities(): Observable<City[]> {
    this._loadingIndicatorService.start();
    return this.locationRestControllerService.getDeliverableCities().pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      takeUntil(this.getDestroyInterceptor()),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  getTowns(cityId: number): Observable<Town[]> {
    this._loadingIndicatorService.start();
    return this.locationRestControllerService.getTowns1(cityId).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      takeUntil(this.getDestroyInterceptor()),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  getDeliverableTowns(cityId: number): Observable<Town[]> {
    this._loadingIndicatorService.start();
    return this.locationRestControllerService.getDeliverableTowns(cityId).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      takeUntil(this.getDestroyInterceptor()),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  getDistricts(townId: number): Observable<District[]> {
    this._loadingIndicatorService.start();
    return this.locationRestControllerService.getDistricts(townId).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      takeUntil(this.getDestroyInterceptor()),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  getDeliverableDistricts(townId: number): Observable<District[]> {
    this._loadingIndicatorService.start();
    return this.locationRestControllerService.getDeliverableDistricts(townId).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      takeUntil(this.getDestroyInterceptor()),
      map((response: ServiceResponseListCity) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  getStreets(districtId: number): Observable<Street[]> {
    this._loadingIndicatorService.start();
    return this.locationRestControllerService.getStreets(districtId).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      takeUntil(this.getDestroyInterceptor()),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  getLocationInfoByDistrictId(districtId: number): Observable<LocationInfo> {
    this._loadingIndicatorService.start();
    return this.locationRestControllerService.getLocationInfoByDistrictId(districtId).pipe(
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      takeUntil(this.getDestroyInterceptor()),
      map((response) => response.data),
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  loadUserLocationAddressDetails(): void {
    this.getLocationInfo$()
      .pipe(
        filter((locationInfo) => !!locationInfo),
        first(),
        filter(
          (locationInfo) =>
            locationInfo.serviceAreaObjectType === ServiceAreaObjectType.DISTRICT && // details are not provided for PICK_POINT and not needed for FOUNDATION
            !locationInfo.locationDetails // load only once
        ),
        switchMap((locationInfo) => {
          this._loadingIndicatorService.start();
          return this.getLocationInfoByDistrictId(locationInfo.serviceAreaObjectId).pipe(
            map((response) => {
              return { ...locationInfo, locationDetails: response };
            }),
            finalize(() => {
              this._loadingIndicatorService.stop();
            })
          );
        })
      )
      .subscribe((detailedLocationInfo) => {
        this._userService.updateLocationInfo(detailedLocationInfo);
      });
  }
}
