import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

import { LoggingService } from '@fe-commerce/core';
import { ServiceAreaObjectType } from '@fe-commerce/shared';

import { catchError, map, tap } from 'rxjs/operators';

import { City, District, LocationRestControllerService, PickPoint, Town } from '@migroscomtr/sanalmarket-angular';
import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'fe-delivery-zone-select-form',
  templateUrl: './delivery-zone-select-form.component.html',
  styleUrls: ['./delivery-zone-select-form.component.scss'],
})
export class DeliveryZoneSelectFormComponent implements OnInit, AfterViewInit {
  @Input() serviceAreaObjectType: ServiceAreaObjectType;

  private readonly portfolio = 'MARKET';

  private _cities$: Observable<City[]>;
  private _towns$: Observable<Town[]>;
  private _districts$: Observable<District[]>;
  private _pickPoints$: Observable<PickPoint[]>;
  private _deliveryZoneFormGroup: FormGroup;

  @ViewChild('deliveryZoneForm', { static: false }) deliveryZoneForm: FormGroupDirective;

  constructor(
    private _formBuilder: FormBuilder,
    private _locationService: LocationRestControllerService,
    private _loggingService: LoggingService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.getCities();
  }

  ngAfterViewInit() {
    this.subscribeToLocationChangeHandlers();
  }

  get cities$(): Observable<City[]> {
    return this._cities$;
  }

  get towns$(): Observable<Town[]> {
    return this._towns$;
  }

  get districts$(): Observable<District[]> {
    return this._districts$;
  }

  get pickPoints$(): Observable<PickPoint[]> {
    return this._pickPoints$;
  }

  get deliveryZoneFormGroup(): FormGroup {
    return this._deliveryZoneFormGroup;
  }

  get cityId(): AbstractControl {
    return this._deliveryZoneFormGroup.get('cityId');
  }

  get serviceAreaObjectId(): AbstractControl {
    return this._deliveryZoneFormGroup.get('serviceAreaObjectId');
  }

  get townId(): AbstractControl {
    return this._deliveryZoneFormGroup.get('townId');
  }

  isServiceAreaTypeDistrict(): boolean {
    return ServiceAreaObjectType.DISTRICT === this.serviceAreaObjectType;
  }

  isServiceAreaTypePickPoint(): boolean {
    return ServiceAreaObjectType.PICK_POINT === this.serviceAreaObjectType;
  }

  private getCities(): void {
    this._cities$ = this._locationService.getDeliverableCities(this.serviceAreaObjectType).pipe(
      map((response) => response.data),
      catchError((error) => {
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      })
    );
  }

  private subscribeToLocationChangeHandlers(): void {
    this.cityId.valueChanges.subscribe((cityId) => {
      this.cityChangeHandler(cityId);
    });

    this.townId.valueChanges.subscribe((townId) => {
      this.townChangeHandler(townId);
    });
  }

  private cityChangeHandler(cityId: number): void {
    this.townId.reset();
    if (cityId) {
      this._towns$ = this._locationService.getDeliverableTowns(cityId, this.serviceAreaObjectType).pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        map((response) => response.data),
        tap(() => {
          this.townId.enable();
        })
      );
    } else {
      this.townId.disable();
    }
  }

  private townChangeHandler(townId: number): void {
    switch (this.serviceAreaObjectType) {
      case ServiceAreaObjectType.DISTRICT:
        this.fetchDistricts(townId);
        break;
      case ServiceAreaObjectType.PICK_POINT:
        this.fetchPickPoints(townId);
        break;
      default:
        throw new Error(`Unsupported serviceAreaObjectType: ${this.serviceAreaObjectType}`);
    }
  }

  private fetchDistricts(townId: number): void {
    this.serviceAreaObjectId.reset();
    if (townId) {
      this._districts$ = this._locationService.getDeliverableDistricts(townId).pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        map((response) => response.data),
        tap(() => {
          this.serviceAreaObjectId.enable();
        })
      );
    } else {
      this.serviceAreaObjectId.disable();
    }
  }

  private fetchPickPoints(townId: number): void {
    this.serviceAreaObjectId.reset();
    if (townId) {
      this._pickPoints$ = this._locationService.getDeliverablePickPoints(townId).pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        map((response) => response.data),
        tap(() => {
          this.serviceAreaObjectId.enable();
        })
      );
    } else {
      this.serviceAreaObjectId.disable();
    }
  }

  private buildForm(): void {
    this._deliveryZoneFormGroup = this._formBuilder.group({
      cityId: [{ value: null, disabled: false }, [Validators.required]],
      townId: [{ value: null, disabled: true }, [Validators.required]],
      serviceAreaObjectId: [{ value: null, disabled: true }, [Validators.required]],
    });
  }
}
