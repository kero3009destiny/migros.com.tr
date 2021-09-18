import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { findLatestRouteChild, SubscriptionAbstract } from '@fe-commerce/shared';

import { filter, map, switchMap, takeUntil } from 'rxjs/operators';

import { PageMetaData } from '@migroscomtr/sanalmarket-angular';
import { combineLatest } from 'rxjs';

import { SeoConfigModel } from '../../models';

import { SeoProviderService, SEO_PROVIDERS } from './seo-provider.service';

export const SEO_CONFIG = new InjectionToken<SeoConfigModel>('SeoConfigModel');

// @dynamic
@Injectable({ providedIn: 'root' })
export class SeoService extends SubscriptionAbstract {
  constructor(
    private _meta: Meta,
    private _titleService: Title,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private _document: Document,
    @Inject(SEO_PROVIDERS) private _seoProviders: SeoProviderService[],
    @Inject(SEO_CONFIG) private _defaultSeoConfig: SeoConfigModel
  ) {
    super();
  }

  subscribeToRouter() {
    this._subscribeToTags();
    this._subscribeToNoIndex();
    this._subscribeToIndex();
  }

  private _subscribeToIndex() {
    this._router.events
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((event) => event instanceof NavigationEnd),
        map(() => this._activatedRoute),
        map((route) => findLatestRouteChild(route)),
        switchMap((route) => route.data),
        map((data) => data?.noIndex ?? false),
        filter((noIndex) => !noIndex)
      )
      .subscribe(() => {
        this.enableIndexing();
      });
  }

  private _subscribeToNoIndex() {
    this._router.events
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((event) => event instanceof NavigationEnd),
        map(() => this._activatedRoute),
        map((route) => findLatestRouteChild(route)),
        switchMap((route) => route.data),
        map((data) => data?.noIndex ?? false),
        filter((noIndex) => noIndex)
      )
      .subscribe(() => {
        this.disableIndexing();
      });
  }

  private _subscribeToTags() {
    this._router.events
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((event) => event instanceof NavigationEnd),
        map(() => this._activatedRoute),
        map((route) => findLatestRouteChild(route)),
        switchMap((route) => combineLatest([route.url, route.data])),
        map(([url, data]) => ({
          ...data,
          ...(data.extras?.seo || {}),
          slug: '/' + url.join(),
        }))
      )
      .subscribe((config) => {
        this.generateTags(config);
        this.generateCanonicalTag();
      });
  }

  disableIndexing() {
    this._meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  enableIndexing() {
    this._meta.removeTag("name='robots'");
  }

  private generateTags(config: Partial<SeoConfigModel>) {
    const mergedConfig = {
      ...this._defaultSeoConfig,
      ...config,
    };

    this._titleService.setTitle(mergedConfig.title);
    this._meta.updateTag({
      name: 'description',
      content: mergedConfig.description,
    });

    this._meta.updateTag({
      name: 'apple-itunes-app',
      content: `${mergedConfig.iosAppLink}${mergedConfig.slug}`,
    });

    this._seoProviders.forEach((seoProvider) => {
      seoProvider.updateTags(mergedConfig);
    });
  }

  private generateCanonicalTag(): void {
    const url = this._document.URL;
    const absoluteUrl = url.split('#')[0].split('?')[0];

    const canonicalLink = this._document.querySelector(`link[rel='canonical']`);

    if (canonicalLink) {
      canonicalLink.setAttribute('href', absoluteUrl);
    } else {
      const link: HTMLLinkElement = this._document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', absoluteUrl);
      this._document.head.appendChild(link);
    }
  }

  getPageTitle(): string {
    return this._titleService.getTitle();
  }

  setMetaData(metaData: PageMetaData): void {
    if (metaData.seoTitle) {
      this._titleService.setTitle(metaData.seoTitle);
    }
    if (metaData.seoDescription) {
      this._meta.updateTag({ name: 'description', content: metaData.seoDescription });
    }
  }
}
