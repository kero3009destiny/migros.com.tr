import { Component, OnInit } from '@angular/core';

import { LoggingService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { EMPTY } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { FaqDTO, FaqRestControllerService, FaqTreeDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-company-info',
  templateUrl: './company-info.page.html',
  styleUrls: ['./company-info.page.scss'],
})
export class CompanyInfoPage extends SubscriptionAbstract implements OnInit {
  private pageContent: FaqTreeDTO[];
  private answer: FaqDTO;

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
          .filter((item) => item.question === 'Daha Fazla')[0]
          ?.children.filter((item) => item.question === 'Hakkımızda')[0];
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
