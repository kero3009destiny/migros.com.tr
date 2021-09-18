import { ActivatedRoute } from '@angular/router';

function findLatestRouteChild(route: ActivatedRoute) {
  let result = route.firstChild;
  if (!result) {
    return route;
  }
  while (result.firstChild) {
    result = result.firstChild;
  }
  return result;
}

export { findLatestRouteChild };
