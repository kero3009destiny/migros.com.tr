import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { LoggingService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { EMPTY } from 'rxjs';
import {
  City,
  LocationRestControllerService,
  MoneyTransferRestControllerService,
  MoneyTransferSelectRequest,
  Town,
} from '@migroscomtr/sanalmarket-angular';

import { AMOUNTS, TYPES } from '../money-transfer';

@Component({
  selector: 'sm-money-transfer-locations',
  templateUrl: './money-transfer-locations.component.html',
  styleUrls: ['./money-transfer-locations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneyTransferLocationsComponent extends SubscriptionAbstract implements OnInit, AfterViewInit {
  @Output() selectedStores = new EventEmitter<any>();
  @Output() moneyTransferWarning = new EventEmitter<any>();

  moneyTransferFormGroup: FormGroup;
  cities: City[];
  towns: Town[];
  amounts = AMOUNTS;
  types = TYPES;

  constructor(
    private _formBuilder: FormBuilder,
    private _locationService: LocationRestControllerService,
    private _loggingService: LoggingService,
    private _moneyTransferService: MoneyTransferRestControllerService
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

  getCity(): AbstractControl {
    return this.moneyTransferFormGroup.get('city');
  }

  getTown(): AbstractControl {
    return this.moneyTransferFormGroup.get('town');
  }

  isButtonDisabled(): boolean {
    return this.moneyTransferFormGroup.invalid;
  }

  isTownDisabled(): boolean {
    return this.getTown().disabled;
  }

  onMoneyTransferSubmit(): void {
    const { city, town, amount, type } = this.moneyTransferFormGroup.value;
    const moneyTransferBody: MoneyTransferSelectRequest = {
      amount: amount,
      cityName: city.name,
      townName: town.name,
      type: type,
    };
    this._moneyTransferService
      .getMoneyTransfers(moneyTransferBody)
      .pipe(
        catchError((error) => {
          if (error.error.errorCode === '00400') {
            this.moneyTransferWarning.emit(error.error.errorDetail);
          }
          return EMPTY;
        }),
        map((response) => response.data)
      )
      .subscribe((stores) => {
        this.selectedStores.emit(stores);
      });
  }

  buildForm(): void {
    this.moneyTransferFormGroup = this._formBuilder.group({
      city: ['', Validators.required],
      town: [{ value: '', disabled: true }, Validators.required],
      amount: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  subscribeToLocationChangeHandlers(): void {
    this.getCity()
      .valueChanges.pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((city) => {
        this.cityChangeHandler(city.id);
      });
  }

  cityChangeHandler(cityId: number): void {
    this.getTown().reset();
    if (cityId) {
      this._locationService
        .getTowns1(cityId)
        .pipe(
          catchError((error) => {
            this._loggingService.logError({ title: 'Hata', message: error });
            return EMPTY;
          }),
          takeUntil(this.getDestroyInterceptor()),
          map((response) => response.data),
          tap(() => {
            this.getTown().enable();
          })
        )
        .subscribe((towns) => {
          this.towns = towns;
        });
    } else {
      this.getTown().disable();
    }
  }

  fetchCities(): void {
    this._locationService
      .getCities1()
      .pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        map((response) => response.data)
      )
      .subscribe((cities) => {
        this.cities = cities;
      });
  }
}
