import { ViewportScroller } from '@angular/common';
import { Injectable } from '@angular/core';

import { AppStateService } from '../app-state/app-state.service';

@Injectable({
  providedIn: 'root',
})
export class ScrollPositionRestorerService {
  private _restoredPageNumber = 1;
  private _restoredScrollPosition: [number, number];

  constructor(private _appStateService: AppStateService, private _viewPortScroller: ViewportScroller) {}

  isUserNavigatedBack(): boolean {
    return this._appStateService.isUserNavigatedViaBackButton();
  }

  getRestoredScrollPosition(): [number, number] {
    return this._restoredScrollPosition;
  }

  getCurrentScrollPosition(): [number, number] {
    return this._viewPortScroller.getScrollPosition();
  }

  getRestoredPageNumber(): number {
    return this._restoredPageNumber;
  }

  setRestoredScrollPosition(): void {
    this._restoredScrollPosition = this.getCurrentScrollPosition();
  }

  setRestoredPageNumber(currentPage: number): void {
    this._restoredPageNumber = currentPage;
  }

  scrollToPosition(): void {
    this._viewPortScroller.scrollToPosition(this._restoredScrollPosition);
  }
}
