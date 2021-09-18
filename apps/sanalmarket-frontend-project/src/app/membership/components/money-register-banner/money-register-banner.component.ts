import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { faArrowCircleRight } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-money-register-banner',
  templateUrl: './money-register-banner.component.html',
  styleUrls: ['./money-register-banner.component.scss'],
})
export class MoneyRegisterBannerComponent {
  arrowIcon = faArrowCircleRight;

  @Input() isCrmVerified: boolean;

  constructor(private _router: Router) {}

  navigateMoneyRegisterPage(): void {
    this._router.navigate(['/money-kayit']);
  }
}
