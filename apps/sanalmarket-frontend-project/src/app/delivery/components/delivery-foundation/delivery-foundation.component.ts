import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoadingIndicatorService, LoggingService, UserService } from '@fe-commerce/core';
import { ServiceAreaObjectType, SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, finalize, map, takeUntil } from 'rxjs/operators';

import { Foundation, LocationRestControllerService } from '@migroscomtr/sanalmarket-angular';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'sm-delivery-foundation',
  templateUrl: './delivery-foundation.component.html',
  styleUrls: ['./delivery-foundation.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeliveryFoundationComponent extends SubscriptionAbstract implements OnInit {
  @Output() deliveryZoneChanged = new EventEmitter<{ districtId: number; type: ServiceAreaObjectType }>();
  deliveryFoundationFormGroup: FormGroup;

  private _foundations: Foundation[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _locationService: LocationRestControllerService,
    private _userService: UserService,
    private _loggingService: LoggingService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {
    super();
  }

  ngOnInit(): void {
    this.buildForm();
    this._fetchFoundations();
  }

  getFoundations(): Foundation[] {
    return this._foundations;
  }

  submitDeliveryZone(): void {
    this.deliveryZoneChanged.emit({
      districtId: this.getServiceAreaObjectId().value.id,
      type: ServiceAreaObjectType.FOUNDATION,
    });
  }

  private _fetchFoundations(): void {
    this._loadingIndicatorService.start();
    this._locationService
      .getDeliverableFoundations()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        map((response) => response.data),
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((foundations) => {
        this._foundations = foundations;
      });
  }

  private getServiceAreaObjectId(): AbstractControl {
    return this.deliveryFoundationFormGroup.get('serviceAreaObjectId');
  }

  private buildForm(): void {
    this.deliveryFoundationFormGroup = this._formBuilder.group({
      serviceAreaObjectId: [{ value: null, disabled: false }, [Validators.required]],
      agreement: [false, [Validators.requiredTrue]],
    });
  }
}
