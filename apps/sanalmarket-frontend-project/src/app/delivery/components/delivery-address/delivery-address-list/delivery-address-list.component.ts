import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { ServiceAreaObjectType, TabModel } from '@fe-commerce/shared';

import { AddressInfoBean } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-delivery-address-list',
  templateUrl: './delivery-address-list.component.html',
  styleUrls: ['./delivery-address-list.component.scss'],
})
export class DeliveryAddressListComponent implements AfterViewChecked {
  @Input() addressList: AddressInfoBean[];

  @Output() deliveryZoneChanged = new EventEmitter<{ districtId: number; type: ServiceAreaObjectType }>();

  @ViewChild('container') container?: ElementRef<HTMLDivElement>;

  isScrollVisible = false;
  isScrolledToBottom = false;

  readonly ADDRESS_TAB: TabModel = { label: 'Kayıtlı Adreslerimden Seç' };
  readonly DISTRICT_TAB: TabModel = { label: 'Farklı Teslimat Noktası Seç' };

  ngAfterViewChecked(): void {
    if (this.container) {
      const nativeContainer = this.container.nativeElement;
      const newVisibleState = nativeContainer.offsetWidth > nativeContainer.clientWidth;
      // To prevent unnecessary change detection triggers
      if (this.isScrollVisible !== newVisibleState) {
        this.isScrollVisible = newVisibleState;
      }
    }
  }

  trackAddress(index, data: AddressInfoBean): number {
    return data.id;
  }

  onAddressSelected(address: AddressInfoBean): void {
    this.deliveryZoneChanged.emit({ districtId: address.districtId, type: ServiceAreaObjectType.DISTRICT });
  }

  onDeliveryZoneChanged($event: { districtId: number; type: ServiceAreaObjectType }): void {
    this.deliveryZoneChanged.emit($event);
  }

  onScroll(event: Event): void {
    const tracker = event.target as HTMLDivElement;
    const isBottom = tracker.scrollHeight === tracker.scrollTop + tracker.offsetHeight;
    // To prevent unnecessary change detection triggers
    if (this.isScrolledToBottom !== isBottom) {
      this.isScrolledToBottom = isBottom;
    }
  }

  onTabSelected(): void {
    this.isScrolledToBottom = false;
  }
}
