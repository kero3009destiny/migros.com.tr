import { Component, OnInit } from '@angular/core';

import { AppStateService, PortfolioEnum } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'sm-how-to',
  templateUrl: './how-to.component.html',
  styleUrls: ['./how-to.component.scss'],
})
export class HowToComponent extends SubscriptionAbstract implements OnInit {
  private _portfolio = PortfolioEnum.MARKET;

  constructor(private _appStateService: AppStateService) {
    super();
  }

  ngOnInit(): void {
    this._subscribeToAppState();
  }

  isPortfolioSanalmarket(): boolean {
    return this._portfolio === PortfolioEnum.MARKET;
  }

  isPortfolioHemen(): boolean {
    return this._portfolio === PortfolioEnum.HEMEN;
  }

  private _subscribeToAppState(): void {
    this._appStateService
      .getPortfolio$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((portfolio) => {
        this._portfolio = portfolio;
      });
  }
}
