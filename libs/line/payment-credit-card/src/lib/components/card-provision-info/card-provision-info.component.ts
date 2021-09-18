import { Component } from '@angular/core';

import { presenceAnimationTrigger } from '@fe-commerce/shared';
import { AppStateService, PortfolioEnum } from '@fe-commerce/core';

import { map } from 'rxjs/operators';

import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons';
import { Observable } from 'rxjs';

@Component({
  // eslint-disable-next-line
  selector: 'fe-card-provision-info',
  templateUrl: './card-provision-info.component.html',
  styleUrls: ['./card-provision-info.component.scss'],
  animations: [presenceAnimationTrigger],
})
export class CardProvisionInfoComponent {
  infoCircleIcon = faInfoCircle;

  constructor(private appStateService: AppStateService) {}

  cardProvisionInfoAvailable(): Observable<boolean> {
    return this.appStateService
      .getPortfolio$()
      .pipe(map((portfolio) => this.doesPortfolioAllowCardProvisionInfo(portfolio)));
  }

  doesPortfolioAllowCardProvisionInfo(portfolio: PortfolioEnum) {
    return portfolio !== PortfolioEnum.KURBAN;
  }
}
