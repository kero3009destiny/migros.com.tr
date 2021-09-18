import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { AppStateService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';
import { presenceAnimationTrigger, SubscriptionAbstract } from '@fe-commerce/shared';

import { takeUntil } from 'rxjs/operators';

import { CookieService } from 'ngx-cookie-service';

import { CookieSettingsService } from '../../services';
import { CookieSettingsComponent } from '../cookie-settings/cookie-settings.component';

@Component({
  selector: 'fe-product-cookie-indicator',
  templateUrl: './cookie-indicator.component.html',
  styleUrls: ['./cookie-indicator.component.scss'],
  animations: [presenceAnimationTrigger],
})
export class CookieIndicatorComponent extends SubscriptionAbstract implements OnInit {
  private modalRef: MatDialogRef<CookieSettingsComponent>;
  private visible = true;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private _envService: EnvService,
    private cookieService: CookieService,
    private cookieSettingsService: CookieSettingsService,
    private _appStateService: AppStateService,
    private _cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.cookieSettingsService.checkIfIndicatorSeenBefore();
    this._appStateService.getCookieIndicatorVisibility().subscribe((visibility) => {
      this.visible = visibility;
      this._cdr.detectChanges();
    });
  }

  isVisible(): boolean {
    return this.visible;
  }

  getCookieUrl(): string {
    if (this._envService.companyName.toLowerCase().includes('migros')) {
      return 'islem-rehberi' + '?id=777';
    }
    return 'cerez-aydinlatma-metni';
  }

  onClickCookieUrl(event: MouseEvent): void {
    event.preventDefault();
    if (this._envService.companyName.toLowerCase().includes('migros')) {
      this.router.navigate(['islem-rehberi'], { queryParams: { id: 777 } });
      return;
    }
    this.router.navigate(['cerez-aydinlatma-metni']);
  }

  onClickCookieSettings(): void {
    this.modalRef = this.dialog.open(CookieSettingsComponent);
    this.modalRef.componentInstance.closeEvent.pipe(takeUntil(this.getDestroyInterceptor())).subscribe(() => {
      this.modalRef.close();
    });
  }

  onClickOkButton(): void {
    this._appStateService.setCookieIndicatorVisibility(false);
    this.cookieSettingsService.onUserInteractCookieSettings();
  }
}
