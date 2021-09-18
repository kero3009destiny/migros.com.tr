import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoggingService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { DynamicPageRestControllerService } from '@migroscomtr/sanalmarket-angular';

import { EMPTY } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'sm-dynamic',
  templateUrl: './dynamic.page.html',
  styleUrls: ['./dynamic.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicPage extends SubscriptionAbstract implements OnInit {
  private _pageContent: string;
  private _pageName: string;
  private _headerImageUrl: string;

  constructor(
    private _dynamicPageService: DynamicPageRestControllerService,
    private _loggingService: LoggingService,
    private _activatedRoute: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchPageContent();
  }

  getPageContent(): string {
    return this._pageContent;
  }

  getPageName(): string {
    return this._pageName;
  }

  getHeaderImageUrl(): string {
    return this._headerImageUrl;
  }

  fetchPageContent(): void {
    const { params, url } = this._activatedRoute.snapshot;
    if (params.dynamicPageId) {
      this._dynamicPageService
        .getDynamicPage(params.dynamicPageId)
        .pipe(
          catchError((error) => {
            this._loggingService.logError({ title: 'Hata', message: error.statusText });
            return EMPTY;
          }),
          takeUntil(this.getDestroyInterceptor()),
          map((response) => response.data)
        )
        .subscribe((data) => {
          this._processData(data);
        });
      return;
    }
    this._dynamicPageService
      .getDynamicPageByStaticUrl(url[0].path)
      .pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error.statusText });
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        map((response) => response.data)
      )
      .subscribe((data) => {
        this._processData(data);
      });
  }

  private _processData(data): void {
    this._pageContent = data.content;
    this._pageName = data.name;
    this._headerImageUrl = data.headerImageUrl;
  }
}
