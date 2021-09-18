import { UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';

import { ROUTE_PRODUCT_PAGE } from '../routes';

export function ProductPageUrlMatchFactory(url: UrlSegment[], _group: UrlSegmentGroup): UrlMatchResult {
  if (url.length === 0) {
    return null;
  }
  const param = url.reduce((previousValue, currentValue) => `${previousValue}/${currentValue}`, '');

  const matched = url[0].toString().match(ROUTE_PRODUCT_PAGE);
  const productId = matched && Number.parseInt(matched[1], 16);

  if (Number.isSafeInteger(productId)) {
    return {
      consumed: url,
      posParams: {
        pathParam: new UrlSegment(param, {}),
        id: new UrlSegment(productId.toString(), {}),
      },
    };
  }

  return null;
}
