import { ChangeDetectorRef, Component } from '@angular/core';
import { AppStateService } from '@fe-commerce/core';
import { takeUntil } from 'rxjs/operators';
import { SubscriptionAbstract } from '@fe-commerce/shared';

@Component({
  selector: 'sm-footer-logos',
  templateUrl: './footer-logos.component.html',
  styleUrls: ['./footer-logos.component.scss'],
})
export class FooterLogosComponent extends SubscriptionAbstract {
  isFooterLite: boolean;

  constructor(private appState: AppStateService, private _changeDetectorRef: ChangeDetectorRef) {
    super();
    this.subscribeToAppState();
  }

  private subscribeToAppState(): void {
    this.appState
      .getFooterLite()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((visibility: boolean) => {
        this.isFooterLite = visibility;
        this._changeDetectorRef.markForCheck();
      });
  }
}
