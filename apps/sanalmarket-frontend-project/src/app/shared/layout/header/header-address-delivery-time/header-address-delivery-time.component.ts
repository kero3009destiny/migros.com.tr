import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { AppStateService } from '@fe-commerce/core';
import { DeliveryScheduleService, LocationService } from '@fe-commerce/delivery';
import { DayNamePipe, presenceAnimationFasterTrigger, SubscriptionAbstract } from '@fe-commerce/shared';

import { takeUntil } from 'rxjs/operators';

import { faHeart, faTimes } from '@fortawesome/pro-light-svg-icons';
import { faChevronDown, faMapMarkerAlt } from '@fortawesome/pro-solid-svg-icons';
import { LocationInfo1, TimeSlotInfoDto } from '@migroscomtr/sanalmarket-angular';

import { DeliveryOptionsModalComponent } from '../../../../delivery';
import { ROUTE_CATEGORIES } from '../../../../routes';
import { ClosestDeliveryTimeComponent } from '../closest-delivery-time/closest-delivery-time.component';

@Component({
  selector: 'sm-header-address-delivery-time',
  templateUrl: './header-address-delivery-time.component.html',
  styleUrls: ['./header-address-delivery-time.component.scss'],
  animations: [presenceAnimationFasterTrigger],
})
export class HeaderAddressDeliveryTimeComponent extends SubscriptionAbstract implements OnInit {
  //ICONS
  faMapMarkerAlt = faMapMarkerAlt;
  faChevronDown = faChevronDown;
  closeIcon = faTimes;
  faHeart = faHeart;

  //STATES
  private chooseDeliveryOptionsPopOverVisibility = true;

  //DATA
  private firstAvailableDate: number | string;
  private firstAvailableTimeSlot: TimeSlotInfoDto;
  private dateTimeSlotMap: {
    [key: string]: Array<TimeSlotInfoDto>;
  };
  private _locationInfo: LocationInfo1;

  // PIPES
  private dayNamePipe = new DayNamePipe();

  constructor(
    private router: Router,
    private locationService: LocationService,
    private appStateService: AppStateService,
    private deliveryScheduleService: DeliveryScheduleService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.initialize();
  }

  isAddressDeliveryTimeBtnVisible(): boolean {
    // *** add routes into parentheses to see address deliveryTimeBtn in the page ***
    const url = this.router.url.replace('/', '');
    return url !== ROUTE_CATEGORIES;
  }

  isDeliveryTypeSelected(): boolean {
    return this.locationService.isDeliveryTypeSelected();
  }

  isChooseDeliveryOptionsPopOverVisible(): boolean {
    if (this.appStateService.isHomePage()) {
      return this.chooseDeliveryOptionsPopOverVisibility;
    } else {
      return false;
    }
  }

  isDeliveryFoundation(): boolean {
    return this.locationService.isDeliveryFoundation();
  }

  isDeliveryPickPoint(): boolean {
    return this.locationService.isDeliveryPickPoint();
  }

  isDeliveryShipment(): boolean {
    return this.locationService.isDeliveryShipment();
  }

  isDeliveryLastMile(): boolean {
    return this.locationService.isDeliveryLastMile();
  }

  getAddressText(): string {
    return this._locationInfo.fullServiceAreaObjectName?.replace(/,/g, ', ');
  }

  getDayName(stringDate: string): string {
    return this.dayNamePipe.transform(stringDate);
  }

  getFirstAvailableDate(): number | string {
    if (!this.firstAvailableDate) {
      return;
    }
    return this.firstAvailableDate;
  }

  getFirstAvailableTimeslot(): TimeSlotInfoDto {
    if (!this.firstAvailableTimeSlot) {
      return;
    }
    return this.firstAvailableTimeSlot;
  }

  onClickDeliveryChoice(): void {
    this.dialog.open(DeliveryOptionsModalComponent, {
      closeOnNavigation: true,
      disableClose: true,
      panelClass: ['delivery-options-modal__container', 'mobile-modal'],
      id: 'modal-component',
      data: {
        title: 'Teslimat Yöntemini Belirle',
      },
    });
  }

  onClickCloseChooseDeliveryOptionsPopOver(event): void {
    event.stopPropagation();
    this.chooseDeliveryOptionsPopOverVisibility = false;
  }

  onClickClosestDeliveryTime(event): void {
    event.stopPropagation();
    this.dialog.open(ClosestDeliveryTimeComponent, {
      data: {
        locationName: this._locationInfo.fullServiceAreaObjectName,
        dateTimeSlotMap: this.dateTimeSlotMap,
      },
    });
  }

  private subscribeToDeliverySchedule(): void {
    this.deliveryScheduleService.scheduleInfo$
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((scheduleInfo) => {
        this.firstAvailableDate = scheduleInfo?.firstAvailableDate;
        this.firstAvailableTimeSlot = scheduleInfo?.firstAvailableTimeSlot;
        this.dateTimeSlotMap = scheduleInfo?.dateTimeSlotMap;
      });
  }

  private initialize(): void {
    this.subscribeToDeliverySchedule();
    this.subscribeToLocationInfo();
  }

  private subscribeToLocationInfo(): void {
    this.locationService
      .getLocationInfo$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((locationInfo) => {
        this._locationInfo = locationInfo;
      });
  }
}
