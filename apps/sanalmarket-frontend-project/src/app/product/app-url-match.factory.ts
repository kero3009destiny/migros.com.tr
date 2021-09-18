import { Route, UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';

export function UrlMatcherFactory(url: UrlSegment[], _group: UrlSegmentGroup, route: Route): UrlMatchResult {
  if (url.length === 0) {
    return null;
  }

  const regexp: RegExp = route.data.regexp;

  const param = url.reduce((previousValue, currentValue) => `${previousValue}/${currentValue}`, '');

  if (param.match(regexp)) {
    return {
      consumed: url,
      posParams: {
        pathParam: new UrlSegment(param, {}),
      },
    };
  }

  return null;
}
