import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { AppStateService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'sm-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent extends SubscriptionAbstract {
  private _isFooterLinksVisible: boolean;

  constructor(private _appState: AppStateService, private _cd: ChangeDetectorRef) {
    super();
    this.subscribeToAppState();
  }

  isFooterLinksVisible(): boolean {
    return this._isFooterLinksVisible;
  }

  private subscribeToAppState(): void {
    this._appState
      .getFooterLinksVisibility()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((visibility: boolean) => {
        this._isFooterLinksVisible = visibility;
        this._cd.markForCheck();
      });
  }
}
