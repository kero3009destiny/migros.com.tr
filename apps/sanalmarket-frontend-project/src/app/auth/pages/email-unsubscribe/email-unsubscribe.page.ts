import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SubscriptionAbstract } from '@fe-commerce/shared';
import { LoggingService } from '@fe-commerce/core';

import { catchError, takeUntil } from 'rxjs/operators';

import { EmailUnsubscribeControllerService } from '@migroscomtr/sanalmarket-angular';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'sm-email-unsubscribe',
  templateUrl: './email-unsubscribe.page.html',
  styleUrls: ['./email-unsubscribe.page.scss'],
})
export class EmailUnsubscribePage extends SubscriptionAbstract implements OnInit {
  isUnsubscribed = false;
  constructor(
    private emailUnsubscribeControllerService: EmailUnsubscribeControllerService,
    private _activatedRoute: ActivatedRoute,
    private _loggingService: LoggingService
  ) {
    super();
  }

  ngOnInit(): void {
    const value = this._activatedRoute.snapshot?.queryParams?.value;
    if (value) {
      this.emailUnsubscribeControllerService
        .unsubscribe(value)
        .pipe(
          catchError((error) => {
            this._loggingService.logError({ title: 'Hata', message: error.error?.errorDetail });
            return EMPTY;
          }),
          takeUntil(this.getDestroyInterceptor())
        )
        .subscribe(() => {
          this.isUnsubscribed = true;
        });
    }
  }
}
