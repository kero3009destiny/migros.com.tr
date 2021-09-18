import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { LoggingService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { EMPTY } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { FaqDTO, FaqRestControllerService, FaqTreeDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-personal-data',
  templateUrl: './personal-data.page.html',
  styleUrls: ['./personal-data.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PersonalDataPage extends SubscriptionAbstract implements OnInit {
  private pageContent: FaqTreeDTO[];
  private mainAnswer: FaqDTO[];
  private answers: FaqDTO[] = [];
  private answer1: FaqDTO;
  private answer2: FaqDTO;
  private answer3: FaqDTO;
  private selectedItem: number;

  constructor(
    private _faqService: FaqRestControllerService,
    private _loggingService: LoggingService,
  ) {
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
        this.mainAnswer = data.filter((i) => i.question === 'Daha Fazla')[0]?.children;
        this.answer1 = this.mainAnswer?.filter((i) => i.question === 'Kişisel Verileri Saklama ve İmha Politikası')[0];
        this.answer2 = this.mainAnswer?.filter(
          (i) => i.question === 'Kişisel Verilerin Korunması ve İşlenmesi Politikası'
        )[0];
        this.answer3 = this.mainAnswer?.filter(
          (i) => i.question === 'Kişisel Verilerin Korunması Hakkında Aydınlatma Metni'
        )[0];

        this.answers.push(this.answer1, this.answer2, this.answer3);
      });
  }

  onClickMenu(event): void {
    this.selectedItem = event;
  }

  isPageContentLoaded(): FaqDTO[] {
    return this.answers;
  }

  getPageContentAnswer(): FaqDTO[] {
    return this.answers;
  }

  getSelectedItem(): number {
    return this.selectedItem;
  }
}
