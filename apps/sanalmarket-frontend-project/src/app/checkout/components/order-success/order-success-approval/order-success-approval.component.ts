import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { faCheckCircle, faChevronRight, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

import { ROUTE_MEMBERSHIP, ROUTE_USER_ORDERS } from '../../../../routes';

@Component({
  selector: 'sm-order-success-approval',
  templateUrl: './order-success-approval.component.html',
  styleUrls: ['./order-success-approval.component.scss'],
})
export class OrderSuccessApprovalComponent {
  @Input() orderId: number;
  @Input() showUserOrdersLink = true;

  faChevronRight: IconDefinition;
  faCheckCircle: IconDefinition;

  constructor(private _router: Router) {
    this.faChevronRight = faChevronRight;
    this.faCheckCircle = faCheckCircle;
  }

  getUserOrdersLink(): string {
    return this.isUserOrdersLinkShown() ? `${ROUTE_MEMBERSHIP}/${ROUTE_USER_ORDERS}` : '';
  }

  isUserOrdersLinkShown(): boolean {
    return this.showUserOrdersLink;
  }

  onClickMyOrders(event: MouseEvent): void {
    event.preventDefault();
    this._router.navigate([`${ROUTE_MEMBERSHIP}/${ROUTE_USER_ORDERS}`]);
  }
}
