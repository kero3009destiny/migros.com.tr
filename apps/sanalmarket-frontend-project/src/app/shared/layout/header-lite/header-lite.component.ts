import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PortfolioEnum, AppStateService } from '@fe-commerce/core';
import { CheckoutAdditionalService } from '@fe-commerce/line-checkout';
import { AdditionalOrderInfoModel, SubscriptionAbstract } from '@fe-commerce/shared';

import { takeUntil } from 'rxjs/operators';

import { ROUTE_HOME } from '../../../routes';

@Component({
  selector: 'sm-header-lite',
  templateUrl: './header-lite.component.html',
  styleUrls: ['./header-lite.component.scss'],
})
export class HeaderLiteComponent extends SubscriptionAbstract implements OnInit {
  private _additionalOrderStatus: AdditionalOrderInfoModel;
  private _isAdditionalOrderHeaderVisible: boolean;
  private _portfolio = PortfolioEnum.MARKET;

  constructor(
    private _additionalOrderService: CheckoutAdditionalService,
    private _appStateService: AppStateService,
    private _router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this._additionalOrderService.isActive$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((status) => {
      this._additionalOrderStatus = status;
    });

    this._subscribeToAppState();
  }

  getPortfolio(): PortfolioEnum {
    return this._portfolio;
  }

  getAdditionalOrderStatus(): AdditionalOrderInfoModel {
    return this._additionalOrderStatus;
  }

  isAdditionalOrderHeaderVisible(): boolean {
    return this._isAdditionalOrderHeaderVisible;
  }

  onClickLogo(): void {
    this._router.navigate([ROUTE_HOME]);
  }

  startAdditionalOrder(orderId: number): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this._additionalOrderService.start(orderId).subscribe(() => {});
  }

  exitAdditionalOrder(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this._additionalOrderService.stop().subscribe(() => {});
  }

  private _subscribeToAppState(): void {
    this._appStateService
      .getAdditionalOrderHeaderVisibility()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((visible) => {
        this._isAdditionalOrderHeaderVisible = visible;
      });

    this._appStateService.getPortfolio$().subscribe((portfolio: PortfolioEnum) => {
      this._portfolio = portfolio;
    });
  }
}
