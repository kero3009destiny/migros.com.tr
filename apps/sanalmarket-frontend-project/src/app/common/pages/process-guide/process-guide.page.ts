import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { GtmService, LoggingService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, filter, map, takeUntil } from 'rxjs/operators';

import { EMPTY } from 'rxjs';
import { FaqDTO, FaqRestControllerService, FaqTreeDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-process-guide',
  templateUrl: './process-guide.page.html',
  styleUrls: ['./process-guide.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProcessGuidePage extends SubscriptionAbstract implements OnInit {
  private _pageContent: FaqTreeDTO[];
  private _answers: FaqDTO[];
  private _selectedItem: number;

  constructor(
    private _faqService: FaqRestControllerService,
    private _loggingService: LoggingService,
    private _activatedRoute: ActivatedRoute,
    private _gtmService: GtmService,
    private _router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this._activatedRoute.queryParams
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((params) => !!params.id),
        map((params) => params.id),
        map((id) => Number.parseInt(id, 10)),
        filter((id) => Number.isSafeInteger(id))
      )
      .subscribe((id) => {
        this._selectedItem = id;
        if (this._pageContent) {
          this.initializeAnswers();
        }
      });
    this.fetchPageContent();
    this.sendGtmPageViewEvent('ProcessGuide');
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
        this._pageContent = data;
        if (this._selectedItem) {
          this.initializeAnswers();
        }
      });
  }

  onClickMenu(faq: FaqDTO, answers: Array<FaqDTO>): void {
    this._selectedItem = faq.id;
    this._answers = answers;
  }

  getPageContent(): FaqTreeDTO[] {
    return this._pageContent;
  }

  getSelectedItem(): number {
    return this._selectedItem;
  }

  getAnswers(): FaqDTO[] {
    return this._answers;
  }

  onClickAnswer(id: number): void {
    this._selectedItem = id;
  }

  sendGtmPageViewEvent(page: string): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Islem Rehberi | Migros Sanal Market',
      virtualPageName: page,
      objectId: '',
    });
  }

  private initializeAnswers(): void {
    this._answers = this._pageContent
      .filter((faqTree) => faqTree.children.find((child) => child.id === this._selectedItem))
      .map((faqTree) => faqTree.children)
      .reduce((prev, curr) => prev.concat(curr), []);
  }
}
