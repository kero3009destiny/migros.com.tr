import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { LoadingIndicatorService, UserService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';
import { CheckoutAdditionalService } from '@fe-commerce/line-checkout';
import { ToasterService } from '@fe-commerce/shared';

import { catchError, filter, finalize, switchMap } from 'rxjs/operators';

import { combineLatest, Observable, throwError } from 'rxjs';
import { RegionRestControllerService, UserInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { DeliveryZoneDialogComponent } from '../components/delivery-zone-dialog/delivery-zone-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DeliveryZoneService {
  private _isAdditionalCheckoutActive = false;

  constructor(
    private _deliveryZoneFormDialog: MatDialog,
    private _regionRestController: RegionRestControllerService,
    private _checkoutAdditionalService: CheckoutAdditionalService,
    private _userService: UserService,
    private _envService: EnvService,
    private _toasterService: ToasterService,
    private _loadingIndicatiorService: LoadingIndicatorService
  ) {
    this._checkoutAdditionalService.isActive$.subscribe((check) => (this._isAdditionalCheckoutActive = check.isActive));

    combineLatest([this._userService.isAuthenticated$, this._userService.hasDistrictId$])
      .pipe(
        filter(([isAuthenticated]) => isAuthenticated === true),
        filter(([, hasDistrict]) => hasDistrict === false),
        filter(() => this._envService.companyName.includes('Macroonline'))
      )
      .subscribe(() => {
        this.openDialog({ disableClose: true });
      });
  }

  openDialog({ disableClose, startAnonymous = false }) {
    if (this._isAdditionalCheckoutActive) {
      this._toasterService.showToaster({
        settings: {
          state: 'information',
        },
        data: {
          title: 'İşlem başarısız!',
          message: 'Ek siparişlerde adres değişimi yapılamamaktadır.',
        },
      });
      return;
    }
    this._openDeliveryZoneDialog(disableClose, startAnonymous);
  }

  private _openDeliveryZoneDialog(disableClose: boolean, startAnonymous = false) {
    const dialogRef = this._deliveryZoneFormDialog.open(DeliveryZoneDialogComponent, {
      panelClass: ['wide-dialog', 'mobile-modal'],
      disableClose: disableClose,
    });
    dialogRef.componentInstance.deliveryZoneFormSubmit.subscribe(({ serviceAreaObjectId, serviceAreaObjectType }) => {
      this.changeDeliveryZoneDialog({ serviceAreaObjectId, type: serviceAreaObjectType }).subscribe(() => {
        dialogRef.close();
        if (startAnonymous) {
          this._userService.startAnonymousCheckout();
        }
      });
    });
  }

  changeDeliveryZoneDialog({ serviceAreaObjectId, type }): Observable<UserInfoDTO> {
    this._loadingIndicatiorService.start();
    return this._regionRestController
      .saveRegion1({ serviceAreaObjectId: serviceAreaObjectId, serviceAreaObjectType: type })
      .pipe(
        catchError((error) => throwError(error)),
        switchMap(() => this._userService.getUserObservable()),
        finalize(() => {
          this._loadingIndicatiorService.stop();
        })
      );
  }
}
