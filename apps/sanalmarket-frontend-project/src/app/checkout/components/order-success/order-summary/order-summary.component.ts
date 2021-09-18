import { Component, Input, OnInit } from '@angular/core';

import { AppStateService, PortfolioEnum } from '@fe-commerce/core';

import { faInfoCircle, IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { OrderPaymentDTO } from '@migroscomtr/sanalmarket-angular';

import { OrderSummaryFields, OrderSummaryType } from '../../../../shared';

export const sidePaymentTypes = [
  'CARD_REWARD',
  'GARANTI_PAY_REWARD',
  'MONEY_POINT',
  'PERSONNEL_BOND',
  'CUSTOMER_BOND',
  'VOUCHER',
];

@Component({
  selector: 'sm-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
})
export class OrderSummaryComponent implements OnInit {
  @Input() orderSummaryFields: OrderSummaryFields;

  faInfoCircle: IconDefinition;
  constructor(private appStateService: AppStateService) {
    this.faInfoCircle = faInfoCircle;
  }

  ngOnInit(): void {
    this.checkDeliveryAddressName();
  }

  checkDeliveryAddressName(): void {
    if (
      this.orderSummaryFields?.orderType === OrderSummaryType.FOUNDATION &&
      !this.orderSummaryFields.deliveryAddressName
    ) {
      throw new Error(
        `No deliveryAddressName given for ${this.orderSummaryFields?.orderType} order type at OrderSummaryComponent`
      );
    }
  }

  isSidePayment(payment: OrderPaymentDTO): boolean {
    return sidePaymentTypes.indexOf(payment.type) >= 0;
  }

  get deliveryFee(): number {
    return this.orderSummaryFields?.deliveryFee < 0 ? 0 : this.orderSummaryFields?.deliveryFee;
  }

  isAnonymousOrderTrackInfoShown(): boolean {
    return !!this.orderSummaryFields.isAnonymousOrderTrackInfoShown;
  }

  getPickPointImageSrc(): string {
    return this.appStateService.getPortfolio() === PortfolioEnum.KURBAN
      ? '/assets/icons/address-selector/migros-m.svg'
      : '/assets/images/tikla-gel-al.png';
  }

  getPickPointLabel(): string {
    return this.appStateService.getPortfolio() === PortfolioEnum.KURBAN ? 'Mağazadan Teslim' : 'Tıkla Gel Al';
  }
}
