import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { LazyScriptLoaderService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { takeUntil } from 'rxjs/operators';

import { CheckoutInfoDTO } from '@migroscomtr/sanalmarket-angular';
import { EnvService } from '@fe-commerce/env-service';

@Component({
  selector: 'sm-bkm',
  templateUrl: './bkm.component.html',
  styleUrls: ['./bkm.component.scss'],
})
export class BkmComponent extends SubscriptionAbstract implements OnInit {
  @Input() checkoutInfo: CheckoutInfoDTO;

  constructor(
    public agreementDialog: MatDialog,
    private _lazyScriptLoaderService: LazyScriptLoaderService,
    private envService: EnvService
  ) {
    super();
  }

  ngOnInit() {
    const bexScriptUrl = this.envService.production
      ? 'https://js.bkmexpress.com.tr/v1/javascripts/bex.js'
      : 'https://preprod-js.bkmexpress.com.tr/v1/javascripts/bex.js';
    this._lazyScriptLoaderService
      .load({ name: 'bkm', src: bexScriptUrl })
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe();
  }
}
