import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { GtmService, LoadingIndicatorService, LoggingService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, distinctUntilChanged, filter, finalize, map, takeUntil, tap } from 'rxjs/operators';

import { EMPTY, Subscription } from 'rxjs';
import { faArrowRight } from '@fortawesome/pro-light-svg-icons';
import {
  City,
  ExternalWarehouseInfoDto,
  ExternalWarehouseService,
  LocationRestControllerService,
  ServiceResponseListCity,
  ServiceResponseListTown,
  Town,
} from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-nearest-store-page',
  templateUrl: './nearest-store-page.component.html',
  styleUrls: ['./nearest-store-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class NearestStorePage extends SubscriptionAbstract implements OnInit, AfterViewInit, OnDestroy {
  arrowRightIcon = faArrowRight;

  private cities: City[];
  private towns: Town[];
  private stores: ExternalWarehouseInfoDto[] = [];

  private selectedStore: ExternalWarehouseInfoDto;
  private storeLocationFormGroup: FormGroup;

  private _subscription = new Subscription();

  constructor(
    private _formBuilder: FormBuilder,
    private _locationService: LocationRestControllerService,
    private _warehouseService: ExternalWarehouseService,
    private _cdr: ChangeDetectorRef,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _loggingService: LoggingService,
    private _titleService: Title,
    private _metaService: Meta,
    private _gtmService: GtmService,
    private _router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.buildForm();
    this.fetchCities();
    this.setDefaultStores();
    this.sendGtmPageViewEvent('NearestStores');
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.subscribeToCityChangeHandler();
    this.subscribeToTownChangeHandler();
  }

  getCity(): AbstractControl {
    return this.storeLocationFormGroup.get('city');
  }

  getTown(): AbstractControl {
    return this.storeLocationFormGroup.get('town');
  }

  isTownDisabled(): boolean {
    return this.getTown().disabled;
  }

  getCities(): City[] {
    return this.cities;
  }

  getTowns(): Town[] {
    return this.towns;
  }

  getStores(): ExternalWarehouseInfoDto[] {
    return this.stores;
  }

  getSelectedStore(): ExternalWarehouseInfoDto {
    return this.selectedStore;
  }

  getStoreLocationFormGroup(): FormGroup {
    return this.storeLocationFormGroup;
  }

  isAvailableStore(): boolean {
    return this.stores.length === 0;
  }

  isSelectedStore(clickedStore: ExternalWarehouseInfoDto): boolean {
    return this.selectedStore?.id === clickedStore?.id;
  }

  setDefaultStores(): void {
    this._loadingIndicatorService.start();
    this._subscription.add(
      this._warehouseService
        .getExternalWarehouses({ cityName: 'İstanbul', townName: 'Ataşehir' })
        .pipe(
          catchError((error) => {
            this._loggingService.logError({ title: 'Hata', message: error });
            return EMPTY;
          }),
          takeUntil(this.getDestroyInterceptor()),
          map((response: ServiceResponseListCity) => response.data),
          finalize(() => this._loadingIndicatorService.stop())
        )
        .subscribe((warehouses) => {
          this.stores = warehouses;
          this._cdr.markForCheck();
        })
    );
  }

  buildForm(): void {
    this.storeLocationFormGroup = this._formBuilder.group({
      city: [{ value: null, disabled: false }],
      town: [{ value: null, disabled: true }],
    });
  }

  onClickStore($event, currentStore: ExternalWarehouseInfoDto): void {
    $event.stopPropagation();
    this.selectedStore = this.stores.find((store) => store.id === currentStore.id);
  }

  findStoreByCity(cityName: string): void {
    this._loadingIndicatorService.start();
    this._subscription.add(
      this._warehouseService
        .getExternalWarehouses({ cityName })
        .pipe(
          catchError((error) => {
            this._loggingService.logError({ title: 'Hata', message: error });
            return EMPTY;
          }),
          takeUntil(this.getDestroyInterceptor()),
          map((response: ServiceResponseListCity) => response.data),
          finalize(() => this._loadingIndicatorService.stop())
        )
        .subscribe((warehouses) => {
          this.stores = warehouses;
          this.selectedStore = warehouses[0];
          this._cdr.markForCheck();
        })
    );
  }

  findStoreByTown(cityName: string, townName: string): void {
    this._loadingIndicatorService.start();
    this._subscription.add(
      this._warehouseService
        .getExternalWarehouses({ cityName, townName })
        .pipe(
          catchError((error) => {
            this._loggingService.logError({ title: 'Hata', message: error });
            return EMPTY;
          }),
          takeUntil(this.getDestroyInterceptor()),
          map((response: ServiceResponseListCity) => response.data),
          finalize(() => this._loadingIndicatorService.stop())
        )
        .subscribe((warehouses) => {
          this.stores = warehouses;
          if (warehouses.length > 0) {
            this.selectedStore = warehouses[0];
          }
          this._cdr.markForCheck();
        })
    );
  }

  cityChangeHandler(cityId: number): void {
    this.getTown().reset();
    if (cityId) {
      this._subscription.add(
        this._locationService
          .getDeliverableTowns(cityId)
          .pipe(
            catchError((error) => {
              this._loggingService.logError({ title: 'Hata', message: error });
              return EMPTY;
            }),
            takeUntil(this.getDestroyInterceptor()),
            tap(() => {
              this.getTown().enable();
            }),
            filter((response: ServiceResponseListTown) => response.successful),
            map((response: ServiceResponseListTown) => response.data)
          )
          .subscribe((towns) => {
            this.towns = towns;
          })
      );
    } else {
      this.getTown().disable();
    }
  }

  fetchCities(): void {
    this._subscription.add(
      this._locationService
        .getDeliverableCities()
        .pipe(
          catchError((error) => {
            this._loggingService.logError({ title: 'Hata', message: error });
            return EMPTY;
          }),
          takeUntil(this.getDestroyInterceptor()),
          map((response: ServiceResponseListCity) => response.data)
        )
        .subscribe((cities) => {
          this.cities = cities;
        })
    );

    this._titleService.setTitle('En Yakın Migros Mağazası');
    this._metaService.updateTag({
      name: 'description',
      content:
        'Aradığınız tüm ürünler uygun fiyatlarla Migros mağazalarında! Size en yakın Migros mağazalarının adres bilgileri için hemen tıklayın!',
    });
  }

  subscribeToCityChangeHandler(): void {
    this._subscription.add(
      this.getCity()
        .valueChanges.pipe(distinctUntilChanged(), takeUntil(this.getDestroyInterceptor()))
        .subscribe((city) => {
          this.cityChangeHandler(city.id);
          this.findStoreByCity(city.name);
        })
    );
  }

  subscribeToTownChangeHandler(): void {
    this._subscription.add(
      this.getTown()
        .valueChanges.pipe(distinctUntilChanged(), takeUntil(this.getDestroyInterceptor()))
        .subscribe((town) => {
          if (town) {
            this.findStoreByTown(this.getCity().value.name, town?.name);
          }
        })
    );
  }

  sendGtmPageViewEvent(page: string): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'En Yakın Migros | Migros Sanal Market',
      virtualPageName: page,
      objectId: '',
    });
  }
}
