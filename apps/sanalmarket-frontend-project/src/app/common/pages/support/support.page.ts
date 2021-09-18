import { Component, OnInit } from '@angular/core';

import { LoggingService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { EMPTY } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { FaqDTO, FaqRestControllerService, FaqTreeDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
})
export class SupportPage extends SubscriptionAbstract implements OnInit {
  pageContent: FaqTreeDTO[];
  answer: FaqDTO;

  constructor(private _faqService: FaqRestControllerService, private _loggingService: LoggingService) {
    super();
  }

  ngOnInit() {
    this.fetchPageContent();
  }

  fetchPageContent(): void {
    this._faqService
      .get3()
      .pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        map((response) => response.data)
      )
      .subscribe((data) => {
        this.pageContent = data;
        this.answer = data
          .filter((i) => i.question === 'Destek')[0]
          ?.children.filter((i) => i.question === 'Müşteri Hizmetleri')[0];
      });
  }

  isPageContentLoaded(): FaqDTO {
    return this.answer;
  }

  getPageContentAnswer(): string {
    return this.answer.answer;
  }

  getPageContentQuestion(): string {
    return this.answer.question;
  }
}
