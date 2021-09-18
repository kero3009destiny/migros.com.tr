import { Component } from '@angular/core';

import { faTruck, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'sm-order-is-shipment-warning',
  templateUrl: './order-is-shipment-warning.component.html',
  styleUrls: ['./order-is-shipment-warning.component.scss'],
})
export class OrderIsShipmentWarningComponent {
  // ICONS
  private truckIcon = faTruck;

  getTruckIcon(): IconDefinition {
    return this.truckIcon;
  }
}
