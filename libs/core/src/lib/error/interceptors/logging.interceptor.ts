import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http'
import { finalize, tap } from 'rxjs/operators'
import { EnvService } from '@fe-commerce/env-service'

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private _envService: EnvService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (!this._envService.logger) {
      // Return exactly
      return next.handle(req)
    }
    const startTime = Date.now()
    let status: 'succeed' | 'failed' | ''

    return next.handle(req).pipe(
      tap(
        event => {
          status = ''
          if (event instanceof HttpResponse) {
            status = 'succeed'
          }
        },
        () => (status = 'failed')
      ),
      finalize(() => {
        const elapsedTime = Date.now() - startTime
        const message = `%c ${req.method} ${req.urlWithParams} ${status} ${elapsedTime}ms`

        this.logDetails(message)
      })
    )
  }

  private logDetails(msg: string) {
    console.info(msg, 'background: #222; color: #bada55')
  }
}
