import { UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';

import { ROUTE_DYNAMIC_PAGE } from '../routes';

export function DynamicPageUrlMatchFactory(url: UrlSegment[], _group: UrlSegmentGroup): UrlMatchResult {
  if (url.length === 0) {
    return null;
  }

  const matched = url[0].toString().match(ROUTE_DYNAMIC_PAGE);

  if (matched) {
    const dynamicPageId = Number.parseInt(matched[1], 16);

    if (Number.isNaN(dynamicPageId)) {
      return null;
    }

    return {
      consumed: url,
      posParams: {
        dynamicPageId: new UrlSegment(dynamicPageId.toString(), {}),
      },
    };
  }

  return null;
}
