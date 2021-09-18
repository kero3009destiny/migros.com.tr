/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NotFoundComponent, ReferrerResolver, RouteGuard } from '@fe-commerce/core';

import { QuicklinkStrategy } from 'ngx-quicklink';

import { ROUTE_ELECTRONIC, ROUTE_HEMEN } from './routes';

const children = [
  {
    path: '',
    loadChildren: () => import('./product/product.module').then((m) => m.ProductModule),
  },
  {
    path: '',
    loadChildren: () => import('./checkout/checkout.module').then((m) => m.SmCheckoutModule),
  },
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then((m) => m.SmAuthModule),
  },
  {
    path: '',
    loadChildren: () => import('./common/common.module').then((m) => m.CommonModule),
  },
  {
    path: '',
    loadChildren: () => import('./membership/membership.module').then((m) => m.SmMembershipModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        {
          path: '',
          resolve: { discarded: ReferrerResolver },
          runGuardsAndResolvers: 'always',
          children: [
            ...children,
            {
              path: ROUTE_ELECTRONIC,
              canActivate: [RouteGuard],
              children: [...children],
            },
            {
              path: ROUTE_HEMEN,
              canActivate: [RouteGuard],
              children: [...children],
            },
            {
              path: '404',
              component: NotFoundComponent,
              data: {
                screenName: '404',
                noIndex: true,
              },
            },
            {
              path: '**',
              redirectTo: '/404',
            },
          ],
        },
      ],
      {
        preloadingStrategy: QuicklinkStrategy,
        scrollPositionRestoration: 'top',
      }
    ),
  ],
  exports: [RouterModule],
})
export class SmAppRoutingModule {}
