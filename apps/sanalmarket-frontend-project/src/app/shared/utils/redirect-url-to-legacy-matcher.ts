import { Route, UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';

const redirectToLegacyUrlRegexList: RegExp[] = window.__env.isElectronicEnabled ? [] : [/^elektronik\//];

export function RedirectUrlToLegacyMatcher(url: UrlSegment[], _group: UrlSegmentGroup, route: Route): UrlMatchResult {
  const fullPath = url.map((part) => part.path).join('/');
  if (redirectToLegacyUrlRegexList.some((exp) => exp.exec(fullPath))) {
    return { consumed: url };
  }

  return null;
}
