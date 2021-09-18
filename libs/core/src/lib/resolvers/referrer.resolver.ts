import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { findLatestRouteChild } from '@fe-commerce/shared';

import { Observable } from 'rxjs';

import { ReferrerEventService } from '../services/referrer-event/referrer-event.service';

interface ListPageRegex {
  regexp: RegExp;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ReferrerResolver implements Resolve<void> {
  constructor(private _referrerEventService: ReferrerEventService) {}

  private LIST_NAMES: ListPageRegex[] = [
    { regexp: /.*-b-([0-9a-fA-F]+)\/.*-c-([0-9a-fA-F]+)$/, name: 'Brand Category' },
    { regexp: /.*-c-([0-9a-fA-F]+)$/, name: 'Category' },
    { regexp: /.*-b-([0-9a-fA-F]+)$/, name: 'Brand' },
    { regexp: /.*-l-([0-9a-fA-F]+)$/, name: 'ShoppingList' },
    { regexp: /.*-x-([0-9a-fA-F]+)$/, name: 'DynamicPage' },
    { regexp: /.*-dt-([0-9a-fA-F]+)$/, name: 'Campaign Detail' },
  ];

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<void> {
    const screenName = this._resolveScreenName(route, state);
    if (screenName == null) {
      return;
    }
    return this._referrerEventService.pushScreen(screenName);
  }

  private _resolveScreenName(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): string | null {
    // @ts-ignore
    const latestRouteChild = findLatestRouteChild(route);
    if (!!latestRouteChild.data['screenName']) {
      return latestRouteChild.data['screenName'];
    }
    const { url } = state;
    const filteredListName = this.LIST_NAMES.filter((listName) => listName.regexp.test(url));
    if (filteredListName.length > 0) {
      return filteredListName[0].name;
    }

    console.warn(`No suitable screen name found for url: ${url}`);
    return null;
  }
}
