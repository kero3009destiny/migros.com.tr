import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { GtmService, LoadingIndicatorService, LoggingService, SeoService } from '@fe-commerce/core';
import { BreakpointObserverRef } from '@fe-commerce/shared';

import { combineLatest, EMPTY, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import {
  BrandResponseDTO,
  BrandRestControllerService,
  ShoppingListSystemRestControllerService,
} from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-brands-page',
  templateUrl: './brands.page.html',
  styleUrls: ['./brands.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BrandsPage extends BreakpointObserverRef implements OnInit, OnDestroy {
  brands: { [key: string]: BrandResponseDTO[] };
  featuredBrands = [];
  sortedBrandKeys: string[] = [];
  computedBrandKeys: string[] = [];
  activeLink = '';
  breadcrumbs = [
    {
      label: 'Markalar',
      url: 'markalar',
    },
  ];
  private _brandsSubscription: Subscription;

  constructor(
    public breakpointObserver: BreakpointObserver,
    private _seoService: SeoService,
    private _router: Router,
    private _brandsRestService: BrandRestControllerService,
    private _shoppingListRestService: ShoppingListSystemRestControllerService,
    private _gtmService: GtmService,
    private _loggingService: LoggingService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {
    super(breakpointObserver);
  }

  ngOnInit() {
    this.getBrands();
    this.sendGtmPageViewEvent('Brands');
    super.ngOnInit();
  }

  ngOnDestroy() {
    this._brandsSubscription?.unsubscribe();
    super.ngOnDestroy();
  }

  getBrands() {
    this._loadingIndicatorService.start();
    this._brandsSubscription = combineLatest([
      this._brandsRestService.getAlphabeticalBrandsMap(false),
      this._shoppingListRestService.getBrandGroupLists('MIGROS'),
    ])
      .pipe(
        catchError((err) => {
          this._loggingService.logError({ title: 'Hata', message: err });
          return EMPTY;
        }),
        map(([fetchAlphabeticalMappedBrands, fetchFeauredBrands]) => {
          this.featuredBrands = fetchFeauredBrands.data[0] ? fetchFeauredBrands.data[0].shoppingLists : [];
          return fetchAlphabeticalMappedBrands.data;
        }),
        finalize(() => {
          this._loadingIndicatorService.stop();
        })
      )
      .subscribe((data) => {
        this.sortedBrandKeys = Array.from(Object.keys(data));
        this.computedBrandKeys = [...this.sortedBrandKeys];

        if (this.featuredBrands && this.featuredBrands.length > 0) {
          this.activeLink = this.computedBrandKeys[0];
        }
        this.brands = data;
      });
  }

  scrollTo(key) {
    document.getElementById('brand-key-' + key).scrollIntoView(true);
    window.scrollBy(
      0,
      -document.getElementsByTagName('sm-header')[0].getBoundingClientRect().height -
        document.getElementsByTagName('nav')[0].getBoundingClientRect().height
    );
  }

  sendGtmPageViewEvent(page) {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Markalar | Migros Sanal Market',
      virtualPageName: page,
      objectId: '',
    });
  }

  onBrandSelected(selectedBrand: BrandResponseDTO) {
    this._router.navigate(['/' + selectedBrand.prettyName], {
      state: { referrerEventId: selectedBrand.referrerEventId },
    });
  }
}
