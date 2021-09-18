import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductScreenResolver, RegionGuard, RouteGuard } from '@fe-commerce/core';

import {
  ROUTE_CART,
  ROUTE_HOME,
  ROUTE_PRODUCT_PAGE,
  ROUTE_PRODUCT_SEARCH_LIST_PAGE,
  ROUTE_PRODUCT_SEARCH_PAGE,
  ROUTE_SACRIFICE,
} from '../routes';

import { UrlMatcherFactory } from './app-url-match.factory';
import { ProductComponent } from './components';
import { CartPage, ListPage, ProductDetailPage } from './pages/';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProductPageUrlMatchFactory } from './product-page-url-match.factory';

const routes: Routes = [
  {
    path: '',
    component: ProductComponent,
    canActivate: [RouteGuard],
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: ROUTE_HOME,
        component: HomePageComponent,
        data: { screenName: 'Home', shouldSkipFetchingCart: true },
      },
      {
        path: ROUTE_SACRIFICE,
        canActivate: [RouteGuard],
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        loadChildren: () => import('../kurban/kurban.module').then((m) => m.KurbanModule),
      },
      {
        path: ROUTE_CART,
        component: CartPage,
        canActivate: [RegionGuard],
        data: { screenName: 'Shopping Cart', shouldSkipFetchingCart: true, noIndex: true },
      },
      {
        matcher: ProductPageUrlMatchFactory,
        component: ProductDetailPage,
        data: {
          regexp: ROUTE_PRODUCT_PAGE,
          page: 'product',
          screenName: 'ProductDetail',
          shouldSkipFetchingCart: true,
        },
        resolve: { extras: ProductScreenResolver },
      },
      {
        matcher: UrlMatcherFactory,
        component: ListPage,
        data: { regexp: ROUTE_PRODUCT_SEARCH_LIST_PAGE, shouldSkipFetchingCart: true },
      },
      {
        path: ROUTE_PRODUCT_SEARCH_PAGE,
        component: ListPage,
        data: { screenName: 'Search', shouldSkipFetchingCart: true, noIndex: true },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductRoutingModule {}
