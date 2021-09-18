import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material-experimental/mdc-button';
import { RouterModule } from '@angular/router';

import { ProductModule as feCommerceProductModule } from '@fe-commerce/product';
import { MaterialModule, SharedModule } from '@fe-commerce/shared';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { SmProductActionsComponent } from '../components';

import { FooterLinksComponent } from './footer/footer-links/footer-links.component';
import { FooterLogosComponent } from './footer/footer-logos/footer-logos.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderLiteComponent } from './header-lite/header-lite.component';
import { CartDropdownItemComponent } from './header/cart-dropdown/cart-dropdown-item/cart-dropdown-item.component';
import { CartDropdownListComponent } from './header/cart-dropdown/cart-dropdown-list/cart-dropdown-list.component';
import { CartDropdownComponent } from './header/cart-dropdown/cart-dropdown.component';
import { ClosestDeliveryTimeComponent } from './header/closest-delivery-time/closest-delivery-time.component';
import { HeaderAddressDeliveryTimeComponent } from './header/header-address-delivery-time/header-address-delivery-time.component';
import { HeaderComponent } from './header/header.component';
import { MobileBottomNavComponent } from './mobile-bottom-nav/mobile-bottom-nav.component';
import { AdditonalOrderComponent } from './header/additonal-order/additonal-order.component';
import { HeaderLandingPageComponent } from './header-landing-page/header-landing-page.component';

@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    CartDropdownComponent,
    CartDropdownListComponent,
    CartDropdownItemComponent,
    ClosestDeliveryTimeComponent,
    MobileBottomNavComponent,
    FooterLinksComponent,
    FooterLogosComponent,
    HeaderLiteComponent,
    HeaderAddressDeliveryTimeComponent,
    AdditonalOrderComponent,
    SmProductActionsComponent,
    HeaderLandingPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    SharedModule,
    MaterialModule,
    feCommerceProductModule,
    MatButtonModule,
  ],
  exports: [
    FooterComponent,
    HeaderComponent,
    MobileBottomNavComponent,
    HeaderLiteComponent,
    AdditonalOrderComponent,
    SmProductActionsComponent,
    HeaderLandingPageComponent,
  ],
})
export class LayoutModule {}
