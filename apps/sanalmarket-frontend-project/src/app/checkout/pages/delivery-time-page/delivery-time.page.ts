import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppStateService, GtmService, LoggingService } from '@fe-commerce/core';
import { CheckoutService, CheckoutSteps, DeliveryTimeInfo } from '@fe-commerce/line-checkout';
import { presenceAnimationTrigger, SubscriptionAbstract } from '@fe-commerce/shared';

import { distinctUntilKeyChanged, filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { faInfoCircle, IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import {
  CheckoutInfoDTO,
  CheckoutScheduleFormBean,
  ScheduleInfoDto,
  TimeSlotInfoDto,
} from '@migroscomtr/sanalmarket-angular';

import { ROUTE_DELIVERY_PAYMENT, ROUTE_ORDER } from '../../../routes';
import { ServiceAreaObjectType } from '../../../shared';

export enum DeliveryType {
  INSTANT = 'INSTANT',
  TIMESLOT = 'TIME_SLOT',
}

@Component({
  selector: 'sm-delivery-time-page',
  templateUrl: './delivery-time.page.html',
  styleUrls: ['./delivery-time.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [presenceAnimationTrigger],
})
export class DeliveryTimePage extends SubscriptionAbstract implements OnInit {
  private _checkoutInfo: CheckoutInfoDTO;
  private _scheduleInfo: ScheduleInfoDto;
  private _contactlessDelivery = false;
  private _ringBell = true;
  private _deliveryDate: string;
  private _selectedTimeSlot: TimeSlotInfoDto;
  private _selectedDeliveryType: string;
  private _checkoutId: number;
  private _isLoading = true;
  private _infoIcon: IconDefinition = faInfoCircle;
  private _timeSlotId: number;
  private _initialDeliveryType: DeliveryType;

  constructor(
    private _checkoutService: CheckoutService,
    private cd: ChangeDetectorRef,
    private _gtmService: GtmService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _loggingService: LoggingService,
    private _appStateService: AppStateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToRouter();
    this.subscribeToCheckout();
    this.sendGtmPageViewEvent('DeliveryTime', this._checkoutId);
  }

  getCheckoutInfo(): CheckoutInfoDTO {
    return this._checkoutInfo;
  }

  getScheduleInfo(): ScheduleInfoDto {
    return this._scheduleInfo;
  }

  getTitle(): string {
    return this.isPickPointDelivery()
      ? 'Siparişini seçtiğin mağazadan teslim alabileceğin zaman aralığını seç'
      : this.isInstantEnabled()
      ? 'Teslimat zamanını seç'
      : 'Sana uygun gün ve saat aralığını seç';
  }

  getSelectedDeliveryTime(): DeliveryTimeInfo | null {
    return this._selectedTimeSlot && this._deliveryDate
      ? {
          timeSlot: this._selectedTimeSlot,
          date: this._deliveryDate,
        }
      : null;
  }

  getInfoIcon(): IconDefinition {
    return this._infoIcon;
  }

  getTimeSlotId(): number {
    return this._timeSlotId;
  }

  getInitialDeliveryType(): DeliveryType {
    return this._initialDeliveryType;
  }

  isInstantEnabled(): boolean {
    return this._scheduleInfo?.instantDelivery;
  }

  isLoading(): boolean {
    return this._isLoading;
  }

  showTimeSlot(): boolean {
    return !this.isInstantEnabled() || this._selectedDeliveryType === DeliveryType.TIMESLOT;
  }

  isPickPointDelivery(): boolean {
    return this._checkoutInfo.line.deliveryAddressObjectType === ServiceAreaObjectType.PICK_POINT;
  }

  isRingDoorbellSelected(): boolean {
    return this._ringBell;
  }

  isContactlessSelected(): boolean {
    return this._contactlessDelivery;
  }

  onChangeContactless(isContactless: boolean): void {
    this._contactlessDelivery = isContactless;
  }

  onChangeRing(isRingBell: boolean): void {
    this._ringBell = isRingBell;
  }

  onSubmit(): void {
    if (this._selectedTimeSlot?.regionTimeSlotId || this._selectedDeliveryType === DeliveryType.INSTANT) {
      this.createCheckoutDeliveryTime();
    } else {
      this._loggingService.logError({
        message: 'Lütfen teslimat zamanınızı seçiniz.',
        title: '',
      });
    }
  }

  onDeliveryTypeSelect(type: string): void {
    this._selectedDeliveryType = type;

    if (type === DeliveryType.INSTANT) {
      this._checkoutService.updateCheckout({
        ...this._checkoutInfo,
        deliveryPrice: this._scheduleInfo?.regularInstantDeliveryFee,
        shownDeliveryFee: this._scheduleInfo?.instantDeliveryFee,
        revenue:
          this._checkoutInfo.revenue + this._scheduleInfo?.instantDeliveryFee - this._checkoutInfo.shownDeliveryFee,
      });
      this.cd.markForCheck();
    }
  }

  onDeliveryTimeSelected(deliveryTimeInfo: DeliveryTimeInfo): void {
    this._deliveryDate = deliveryTimeInfo?.date;
    this._selectedTimeSlot = deliveryTimeInfo?.timeSlot;
    this._checkoutService.updateCheckout({
      ...this._checkoutInfo,
      deliveryPrice: deliveryTimeInfo?.timeSlot?.regularDeliveryPrice,
      shownDeliveryFee: deliveryTimeInfo?.timeSlot?.deliveryPrice,
      revenue:
        this._checkoutInfo.revenue + deliveryTimeInfo?.timeSlot?.deliveryPrice - this._checkoutInfo.shownDeliveryFee,
    });
    this.cd.markForCheck();
  }

  createCheckoutDeliveryTime(): void {
    const deliveryTimeBody: CheckoutScheduleFormBean = {
      contactless: this._contactlessDelivery,
      ringDoorbell: this._ringBell,
      deliveryDate: this._deliveryDate,
      districtTimeSlotId: this._selectedTimeSlot?.regionTimeSlotId,
      instantDelivery: this._selectedDeliveryType === 'INSTANT',
    };
    this._checkoutService.schedule(this._checkoutId, deliveryTimeBody).subscribe((data: CheckoutInfoDTO) => {
      this._router.navigate([ROUTE_ORDER, ROUTE_DELIVERY_PAYMENT, data?.line.id]);
    });
  }

  sendGtmPageViewEvent(page, id): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Teslimat zamanı | Sanalmarket',
      virtualPageName: page,
      objectId: id,
    });
  }

  setDefaultOptions(checkoutInfo: CheckoutInfoDTO): void {
    this._timeSlotId = checkoutInfo.line?.timeSlotId;

    if (checkoutInfo?.line?.embeddedNoteInfo) {
      const embeddedNoteInfo = JSON.parse(checkoutInfo.line.embeddedNoteInfo);
      this._ringBell = embeddedNoteInfo.ringDoorbell;
      this._contactlessDelivery = embeddedNoteInfo?.dropoffChoice === 'LEAVE_TO_DOOR';
    }

    if (checkoutInfo?.line?.scheduleType) {
      this._initialDeliveryType =
        checkoutInfo.line.scheduleType === 'INSTANT' ? DeliveryType.INSTANT : DeliveryType.TIMESLOT;
      this._selectedDeliveryType = this._initialDeliveryType;
    }
  }

  private subscribeToCheckout(): void {
    this._checkoutService.checkout$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((checkoutInfo) => !!Object.keys(checkoutInfo).length),
        tap((checkoutInfo) => {
          this._checkoutInfo = checkoutInfo;
        }),
        distinctUntilKeyChanged('line', (prev, curr) => prev.id === curr.id),
        tap((checkoutInfo) => {
          this.sendGtmEvent(checkoutInfo);
          this.setDefaultOptions(checkoutInfo);
          this._checkoutService.fetchScheduleInfo(this._checkoutId);
        }),
        switchMap(() => this._checkoutService.getScheduleInfo()),
        filter((scheduleInfo) => !!Object.keys(scheduleInfo).length)
      )
      .subscribe((scheduleInfo) => {
        this._scheduleInfo = scheduleInfo;
        this._isLoading = false;
        this.cd.detectChanges();
      });
  }

  private sendGtmEvent(checkoutInfo): void {
    if (checkoutInfo && checkoutInfo.itemInfos) {
      const products = checkoutInfo.itemInfos.map((checkoutItem, index) => {
        return this._gtmService.generateGtmProductData(
          checkoutItem.product,
          index,
          'checkout/deliveryTime',
          checkoutItem.item.amount,
          checkoutItem.totalDiscount
        );
      });

      const data = {
        event: 'ecommerceCheckout',
        nonInteraction: true,
        eventType: 'Checkout',
        ecommerce: {
          checkout: {
            actionField: { step: 2 },
            products,
          },
        },
      };

      this._gtmService.sendCheckoutEvent(data);
    }
  }

  private subscribeToRouter(): void {
    this._activatedRoute.params.subscribe((params) => {
      this._checkoutId = params['id'];
      if (this._appStateService.isUserVisitingAppFirstTime() || this._appStateService.isUserNavigatedViaBackButton()) {
        this._checkoutService.getCheckoutInfo(this._checkoutId, CheckoutSteps.SCHEDULE);
      }
    });
  }
}
