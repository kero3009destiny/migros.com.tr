import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Directive, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { CustomBreakPoints } from '../constants';

@Directive()
export abstract class BreakpointObserverRef implements OnInit, OnDestroy {
  private _breakPointSubscription?: Subscription;
  isExtraSmallScreen: boolean;
  isMediumScreen: boolean;
  isSmallScreen: boolean;
  isLargeScreen: boolean;
  isExtraLargeScreen: boolean;

  protected constructor(protected breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.subscribeToBreakPoints();
  }

  ngOnDestroy() {
    if (this._breakPointSubscription) {
      this._breakPointSubscription.unsubscribe();
    }
  }

  private subscribeToBreakPoints() {
    this._breakPointSubscription = this.breakpointObserver
      .observe([
        CustomBreakPoints.xs,
        CustomBreakPoints.sm,
        CustomBreakPoints.md,
        CustomBreakPoints.lg,
        CustomBreakPoints.xl,
      ])
      .subscribe((state: BreakpointState) => this.handleBreakPoints(state));
  }

  private handleBreakPoints(state: BreakpointState) {
    this.isExtraSmallScreen = state.breakpoints[CustomBreakPoints.xs];
    this.isSmallScreen = state.breakpoints[CustomBreakPoints.sm];
    this.isMediumScreen = state.breakpoints[CustomBreakPoints.md];
    this.isLargeScreen = state.breakpoints[CustomBreakPoints.lg];
    this.isExtraLargeScreen = state.breakpoints[CustomBreakPoints.xl];
    this.onScreenSizeChange(state);
  }

  // Will be overwritten
  // tslint:disable-next-line:no-empty
  onScreenSizeChange(_state: BreakpointState): void {}
}
