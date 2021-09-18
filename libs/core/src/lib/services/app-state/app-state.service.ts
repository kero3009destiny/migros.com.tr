import { Injectable } from '@angular/core';
import { NavigationStart, ResolveEnd, Router } from '@angular/router';

import { EnvService } from '@fe-commerce/env-service';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { filter, skip, take, takeUntil } from 'rxjs/operators';

import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

export const ROUTE_ELECTRONIC_REGEX = new RegExp('\\/elektronik$|\\/elektronik\\/');

export const ROUTE_KURBAN_REGEX = new RegExp('\\/kurban$|\\/kurban\\/');

export const ROUTE_HEMEN_REGEX = new RegExp('\\/hemen$|\\/hemen\\/');

export enum PortfolioEnum {
  MARKET = 'sanalmarket',
  ELECTRONIC = 'elektronik',
  KURBAN = 'kurban',
  HEMEN = 'hemen',
}

@Injectable({
  providedIn: 'root',
})
export class AppStateService extends SubscriptionAbstract {
  private _isFooterLinksVisible = new BehaviorSubject<boolean>(true);
  private _isFooterLite = new BehaviorSubject<boolean>(false);
  private _isMobileBottomNavVisible = new BehaviorSubject<boolean>(true);
  private _isMobileAppPopupVisible = new BehaviorSubject<boolean>(true);
  private _isAdditionalOrderHeaderVisible = new BehaviorSubject<boolean>(true);
  private _isCookieIndicatorVisible = new BehaviorSubject<boolean>(true);
  private _isUserVisitingAppFirstTime = true;
  private _isUserNavigatedViaBackButton = false;
  private _portfolio = new BehaviorSubject<PortfolioEnum>(PortfolioEnum.MARKET);

  constructor(private _router: Router, private _envService: EnvService, private _cookiesService: CookieService) {
    super();
    this._subscribeToRouterEvents();
    this.setPortfolio(this._checkPortfolioByUrl(window.location.href));
  }

  setPortfolio(portfolio: PortfolioEnum): void {
    // TODO: Hide footer links on Kurban and Elektronik portfolios
    this.setFooterLinksVisibility(portfolio === PortfolioEnum.MARKET);

    this._cookiesService.set(
      'c_id',
      portfolio === PortfolioEnum.MARKET ? '20' : portfolio === PortfolioEnum.ELECTRONIC ? '21' : '22'
    );

    this._portfolio.next(portfolio);
  }

  getPortfolio(): PortfolioEnum {
    return this._portfolio.getValue();
  }

  getPortfolio$(): Observable<PortfolioEnum> {
    return this._portfolio.asObservable();
  }

  isHomePage(): boolean {
    return this._router.url === '/';
  }

  isUserVisitingAppFirstTime(): boolean {
    return this._isUserVisitingAppFirstTime;
  }

  isUserNavigatedViaBackButton(): boolean {
    return this._isUserNavigatedViaBackButton;
  }

  isPortfolioMarket(): boolean {
    return this._portfolio.getValue() === PortfolioEnum.MARKET;
  }

  isPortfolioElektronik(): boolean {
    return this._portfolio.getValue() === PortfolioEnum.ELECTRONIC;
  }

  isPortfolioKurban(): boolean {
    return this._portfolio.getValue() === PortfolioEnum.KURBAN;
  }

  setFooterLinksVisibility(visibility: boolean): void {
    this._isFooterLinksVisible.next(visibility);
  }

  getFooterLinksVisibility(): Observable<boolean> {
    return this._isFooterLinksVisible.asObservable();
  }

  setFooterLite(visibility: boolean): void {
    this._isFooterLite.next(visibility);
  }

  getFooterLite(): Observable<boolean> {
    return this._isFooterLite.asObservable();
  }

  setMobileBottomNavVisibility(visibility: boolean): void {
    this._isMobileBottomNavVisible.next(visibility);
  }

  getMobileBottomNavVisibility(): Observable<boolean> {
    return this._isMobileBottomNavVisible.asObservable();
  }

  setAdditionalOrderHeaderVisibility(visibility: boolean): void {
    this._isAdditionalOrderHeaderVisible.next(visibility);
  }

  getMobileAppPopupVisibility(): Observable<boolean> {
    return this._isMobileAppPopupVisible.asObservable();
  }

  setMobileAppPopupVisibility(visibility: boolean): void {
    this._isMobileAppPopupVisible.next(visibility);
  }

  getAdditionalOrderHeaderVisibility(): Observable<boolean> {
    return this._isAdditionalOrderHeaderVisible.asObservable();
  }

  setCookieIndicatorVisibility(visibility: boolean): void {
    this._isCookieIndicatorVisible.next(visibility);
  }

  getCookieIndicatorVisibility(): Observable<boolean> {
    return this._isCookieIndicatorVisible.asObservable();
  }

  private _checkPortfolioByUrl(url: string): PortfolioEnum {
    return ROUTE_ELECTRONIC_REGEX.test(url) && this._envService.isElectronicEnabled
      ? PortfolioEnum.ELECTRONIC
      : ROUTE_KURBAN_REGEX.test(url) && this._envService.isKurbanEnabled
      ? PortfolioEnum.KURBAN
      : ROUTE_HEMEN_REGEX.test(url) && this._envService.isHemenEnabled
      ? PortfolioEnum.HEMEN
      : PortfolioEnum.MARKET;
  }

  private _subscribeToRouterEvents(): void {
    // Check if it is the first time
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        skip(1),
        take(1)
      )
      .subscribe(() => {
        this._isUserVisitingAppFirstTime = false;
      });

    // Check if user navigated via back button
    this._router.events
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((event) => event instanceof NavigationStart)
      )
      .subscribe((event: NavigationStart) => {
        this._isUserNavigatedViaBackButton = event.navigationTrigger === 'popstate';
      });

    // Check url and set portfolio if needed while user navigate
    this._router.events
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((event) => event instanceof ResolveEnd && !this._isUserVisitingAppFirstTime)
      )
      .subscribe((event: ResolveEnd) => {
        const portfolio = this._checkPortfolioByUrl(event.url);
        if (this._portfolio.getValue() !== portfolio) {
          this.setPortfolio(portfolio);
        }
      });
  }
}
