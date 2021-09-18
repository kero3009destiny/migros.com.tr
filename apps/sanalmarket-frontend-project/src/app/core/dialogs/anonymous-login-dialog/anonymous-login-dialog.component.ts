import { Component, OnInit } from '@angular/core';

import { SubscriptionAbstract } from '@fe-commerce/shared';
import { AppStateService, PortfolioEnum } from '@fe-commerce/core';

import { takeUntil } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-anonymous-login-dialog',
  templateUrl: './anonymous-login-dialog.component.html',
  styleUrls: ['./anonymous-login-dialog.component.scss'],
})
export class AnonymousLoginDialogComponent extends SubscriptionAbstract implements OnInit {
  private _faTimes = faTimes;
  private _portfolio = PortfolioEnum.MARKET;

  constructor(private _appStateService: AppStateService) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToAppState();
  }

  getTimesIcon(): IconProp {
    return this._faTimes;
  }

  getTitle(): string {
    return this._portfolio === PortfolioEnum.MARKET ? 'Sanal Market’e Hoşgeldin' : "Migros Ekstra'ya Hoşgeldin";
  }

  private subscribeToAppState(): void {
    this._appStateService
      .getPortfolio$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((portfolio) => {
        this._portfolio = portfolio;
      });
  }
}
