import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard, RouteGuard } from '@fe-commerce/core';

import {
  ROUTE_FAVORITE_PRODUCTS,
  ROUTE_HEALTHY_LIFE,
  ROUTE_MEMBERSHIP,
  ROUTE_MEMBERSHIP_INFORMATION,
  ROUTE_MONEY_REGISTER,
  ROUTE_ORDER_TRACKING,
  ROUTE_POINTS,
  ROUTE_SACRIFICE,
  ROUTE_USER_ADDRESSES,
  ROUTE_USER_ORDERS,
  ROUTE_MONEY_GOLD,
} from '../routes';

import {
  FavoriteItemsPage,
  HealthyLifeJourneyPage,
  MembershipInformationPage,
  MembershipShellPageComponent,
  MoneyPointAndCouponPageComponent,
  MoneyRegisterPage,
  OrdersPage,
  UserAddressessPageComponent,
  MoneyGoldPage,
} from './pages';
import { TrackOrderPage } from './pages/track-order/track-order.page';

const children = [
  {
    path: ROUTE_MEMBERSHIP,
    component: MembershipShellPageComponent,
    canActivate: [RouteGuard],
    children: [
      { path: ROUTE_HEALTHY_LIFE, component: HealthyLifeJourneyPage, data: { screenName: 'HealthyLifeJourney' } },
      {
        path: ROUTE_POINTS,
        component: MoneyPointAndCouponPageComponent,
        data: { screenName: 'MyPoints' },
      },
      {
        path: ROUTE_USER_ADDRESSES,
        component: UserAddressessPageComponent,
        data: { screenName: 'Address' },
        canActivate: [AuthGuard],
      },
      {
        path: ROUTE_MEMBERSHIP_INFORMATION,
        component: MembershipInformationPage,
        data: { screenName: 'MembershipInformation' },
      },
      {
        path: ROUTE_FAVORITE_PRODUCTS,
        component: FavoriteItemsPage,
        data: { screenName: 'Favorites' },
        canActivate: [AuthGuard],
      },
      {
        path: ROUTE_USER_ORDERS,
        component: OrdersPage,
        data: { screenName: 'Order' },
      },
    ],
  },
  {
    path: ROUTE_MONEY_REGISTER,
    component: MoneyRegisterPage,
    canActivate: [AuthGuard, RouteGuard],
    data: { screenName: 'Money Landing Page' },
  },
  {
    path: ROUTE_ORDER_TRACKING,
    component: TrackOrderPage,
    canActivate: [RouteGuard],
    data: { screenName: 'Track Order Page' },
  },
];

@NgModule({
  imports: [
    RouterModule.forChild([
      ...children,
      {
        path: ROUTE_SACRIFICE,
        canActivate: [RouteGuard],
        children,
      },
      {
        path: ROUTE_MONEY_GOLD,
        component: MoneyGoldPage,
        data: { screenName: 'Money Gold Landing Page' },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class MembershipRoutingModule {}
