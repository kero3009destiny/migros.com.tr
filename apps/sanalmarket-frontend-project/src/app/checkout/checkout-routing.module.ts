import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NoAuthGuard, RouteGuard } from '@fe-commerce/core';

import {
  ROUTE_ADDRESS_SELECTOR,
  ROUTE_DELIVERY_ADDRESS_PAGE,
  ROUTE_DELIVERY_PAYMENT,
  ROUTE_DELIVERY_TIME,
  ROUTE_ORDER,
  ROUTE_ORDER_SUCCESS_PAGE,
  ROUTE_SACRIFICE,
} from '../routes';

import { AddressSelectorComponent, CheckoutComponent } from './components';
import { DeliveryAddressPageComponent } from './pages/delivery-address-page/delivery-address-page.component';
import { DeliveryPaymentPage } from './pages/delivery-payment-page/delivery-payment.page';
import { DeliveryTimePage } from './pages/delivery-time-page/delivery-time.page';
import { OrderSuccessPageComponent } from './pages/order-success-page/order-success-page.component';

const kurbanChildren = [
  {
    path: ROUTE_ORDER,
    component: CheckoutComponent,
    children: [
      {
        path: `${ROUTE_DELIVERY_TIME}/:id`,
        component: DeliveryTimePage,
        data: { screenName: 'Checkout Schedule', shouldSkipFetchingCart: true, noIndex: true },
      },
      {
        path: `${ROUTE_ADDRESS_SELECTOR}/:id`,
        component: AddressSelectorComponent,
        data: { screenName: 'Checkout Address', shouldSkipFetchingCart: true, noIndex: true },
      },
      {
        path: `${ROUTE_DELIVERY_PAYMENT}/:id`,
        component: DeliveryPaymentPage,
        data: { screenName: 'Checkout Payment', shouldSkipFetchingCart: true, noIndex: true },
      },
    ],
  },
  {
    path: `${ROUTE_ORDER_SUCCESS_PAGE}/:id`,
    component: OrderSuccessPageComponent,
    data: { screenName: 'Order Success', noIndex: true },
  },
];

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: ROUTE_SACRIFICE,
        canActivate: [RouteGuard],
        children: kurbanChildren,
      },
      {
        path: ROUTE_ORDER,
        component: CheckoutComponent,
        canActivate: [RouteGuard],
        children: [
          {
            path: `${ROUTE_DELIVERY_TIME}/:id`,
            component: DeliveryTimePage,
            data: { screenName: 'Checkout Schedule', shouldSkipFetchingCart: true, noIndex: true },
          },
          {
            path: `${ROUTE_ADDRESS_SELECTOR}/:id`,
            component: AddressSelectorComponent,
            data: { screenName: 'Checkout Address', shouldSkipFetchingCart: true, noIndex: true },
          },
          {
            path: `${ROUTE_DELIVERY_PAYMENT}/:id`,
            component: DeliveryPaymentPage,
            data: { screenName: 'Checkout Payment', shouldSkipFetchingCart: true, noIndex: true },
          },
        ],
      },
      {
        path: '',
        canActivate: [RouteGuard],
        children: [
          {
            path: ROUTE_DELIVERY_ADDRESS_PAGE,
            component: DeliveryAddressPageComponent,
            canActivate: [NoAuthGuard],
            data: { noIndex: true },
          },
          {
            path: `${ROUTE_ORDER_SUCCESS_PAGE}/:id`,
            component: OrderSuccessPageComponent,
            data: { screenName: 'Order Success', noIndex: true },
          },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class SmCheckoutRoutingModule {}
