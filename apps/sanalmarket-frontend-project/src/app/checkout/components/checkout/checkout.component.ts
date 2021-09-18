import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

import { AppStateService } from '@fe-commerce/core';
import { LocationService } from '@fe-commerce/delivery';
import { CheckoutService, Step } from '@fe-commerce/line-checkout';

import { CheckoutInfoDTO } from '@migroscomtr/sanalmarket-angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'sm-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private steps: Step[] = [
    { number: 1, title: 'ADRES', url: 'adres' },
    { number: 2, title: 'TESLİMAT', url: 'teslimat-zamani' },
    { number: 3, title: 'ÖDEME', url: 'odeme' },
  ];

  private nonDeliveryTimeSteps: Step[] = [
    { number: 1, title: 'ADRES', url: 'adres' },
    { number: 2, title: 'ÖDEME', url: 'odeme' },
  ];

  constructor(
    private checkoutService: CheckoutService,
    private _locationService: LocationService,
    private appState: AppStateService
  ) {}

  ngOnInit(): void {
    this.initialize();
  }

  ngOnDestroy(): void {
    this.appState.setFooterLinksVisibility(true);
    this.appState.setMobileBottomNavVisibility(true);
    this.appState.setAdditionalOrderHeaderVisibility(true);
    this.appState.setFooterLite(false);
  }

  getSteps(): Step[] {
    if (this._locationService.isDeliveryShipment() || this._locationService.isDeliveryFoundation()) {
      return this.nonDeliveryTimeSteps;
    }
    return this.steps;
  }

  getCheckoutInfo$(): Observable<CheckoutInfoDTO> {
    return this.checkoutService.checkout$;
  }

  isShipmentWarningVisible(): boolean {
    return this._locationService.isDeliveryShipment();
  }

  initialize(): void {
    this.appState.setFooterLinksVisibility(false);
    this.appState.setMobileBottomNavVisibility(false);
    this.appState.setAdditionalOrderHeaderVisibility(false);
    this.appState.setFooterLite(true);
  }
}
