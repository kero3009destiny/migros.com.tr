import { Component } from '@angular/core';

import { ROUTE_MONEY_GOLD } from '../../../routes';

@Component({
  selector: 'sm-header-landing-page',
  templateUrl: './header-landing-page.component.html',
  styleUrls: ['./header-landing-page.component.scss'],
})
export class HeaderLandingPageComponent {
  isMoneyGoldPage(): boolean {
    const url = location.pathname.replace('/', '');
    return url === ROUTE_MONEY_GOLD;
  }

  getLink(): string {
    if (this.isMoneyGoldPage()) {
      return 'https://www.money.com.tr/gold';
    }
    return;
  }

  getButtonText(): string {
    if (this.isMoneyGoldPage()) {
      return 'Money Gold’a Üye Ol';
    }
    return;
  }
}
