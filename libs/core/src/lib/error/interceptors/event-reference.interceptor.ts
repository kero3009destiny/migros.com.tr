import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ReferrerEventService } from '../../services/referrer-event/referrer-event.service';

@Injectable()
export class EventReferenceInterceptor implements HttpInterceptor {
  constructor(private _referrerEventService: ReferrerEventService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.params.has('reid')) {
      return next.handle(req);
    }
    const currentEventId = this._referrerEventService.getCurrentEventId();
    if (currentEventId == null) {
      return next.handle(req);
    }
    const updatedParams = req.params.set('reid', currentEventId);
    const clonedReq = req.clone({ params: updatedParams });
    return next.handle(clonedReq);
  }
}
