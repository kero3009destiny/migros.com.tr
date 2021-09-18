import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';

import { faChevronDown, faChevronUp, faMapMarkerAlt, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

import {
  CORPORATE_LINKS,
  DIGITAL_LINKS,
  FooterLinkModel,
  GENERAL_LINKS,
  MOBILE_APP_LINKS,
  NEWNESS_LINKS,
  POPULAR_LINKS,
  SOCIAL_LINKS,
} from '../links-data';
import { AppStateService } from '@fe-commerce/core';
import { takeUntil } from 'rxjs/operators';
import { SubscriptionAbstract } from '@fe-commerce/shared';

@Component({
  selector: 'sm-footer-links',
  templateUrl: './footer-links.component.html',
  styleUrls: ['./footer-links.component.scss'],
})
export class FooterLinksComponent extends SubscriptionAbstract {
  markerIcon = faMapMarkerAlt;
  upIcon = faChevronUp;
  downIcon = faChevronDown;

  contentsState = {
    general: false,
    corporate: false,
    popular: false,
    newness: false,
  };

  isFooterLite: boolean;

  constructor(
    private _location: Location,
    private appState: AppStateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super();
    this.subscribeToAppState();
  }

  getGeneralLinks(): FooterLinkModel[] {
    return GENERAL_LINKS;
  }

  getCorporateLinks(): FooterLinkModel[] {
    return CORPORATE_LINKS;
  }

  getPopularLinks(): FooterLinkModel[] {
    return POPULAR_LINKS;
  }

  getNewnessLinks(): FooterLinkModel[] {
    return NEWNESS_LINKS;
  }

  getMobileAppLinks(): FooterLinkModel[] {
    return MOBILE_APP_LINKS;
  }

  getSocialLinks(): FooterLinkModel[] {
    return SOCIAL_LINKS;
  }

  getDigitalLinks(): FooterLinkModel[] {
    return DIGITAL_LINKS;
  }

  getContentIcon(contentName: string): IconDefinition {
    return this.contentsState[contentName] ? this.upIcon : this.downIcon;
  }

  isContentOpen(contentName: string): boolean {
    return this.contentsState[contentName];
  }

  onClickExpandContent(contentName: string): void {
    this.contentsState[contentName] = !this.contentsState[contentName];
  }

  private subscribeToAppState(): void {
    this.appState
      .getFooterLite()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((visibility: boolean) => {
        this.isFooterLite = visibility;
        this._changeDetectorRef.markForCheck();
      });
  }
}
