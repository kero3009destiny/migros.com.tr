/* eslint-disable no-restricted-syntax,@typescript-eslint/no-explicit-any */
import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvService } from '@fe-commerce/env-service';

import { Observable, of } from 'rxjs';

interface MockHttpResponse {
  body?: any;
  headers?: HttpHeaders;
  status?: number;
  statusText?: string;
  url?: string;
}

const baseUrlRegexMatcher = new RegExp(`^${window.location.origin}`);

const urlMockResponseMap: Map<RegExp, MockHttpResponse> = new Map();
// mock side payments
// urlMockResponseMap.set(/^\/rest\/checkouts\/\d+\/card-infos$/, cardInfoResponseWithReward);
// urlMockResponseMap.set(/^\/rest\/checkouts\/\d+\/balances$/, balancesResponseWithMoneyPoint);

// money pay default flow mocks
// urlMockResponseMap.set(/^\/rest\/moneypay\/token$/, moneyPayCheckUserOtpVerified);
// urlMockResponseMap.set(/^\/rest\/moneypay\/users\/token$/, moneyPayCheckUserOtpVerified);
// urlMockResponseMap.set(/^\/rest\/moneypay\/otp\/verify$/, moneyPayVerifyOtpSuccessful);
// urlMockResponseMap.set(/^\/rest\/moneypay\/payments\/options$/, moneyPayPaymentOptionsWithAlternative);

// mock kurban shortfall
// urlMockResponseMap.set(
//   /^\/rest\/checkouts\/\d+\/steps\/PAYMENT(\?reid=\d+)?$/,
//   kurbanCheckoutPaymentResponseWithShortfall
// );

@Injectable()
export class MockResponseInterceptor implements HttpInterceptor {
  constructor(private _envService: EnvService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isMockingActive()) {
      const requestPath = req.urlWithParams.replace(baseUrlRegexMatcher, '');
      const mockHttpResponse = this.getResponseFromMockedMap(requestPath);
      if (mockHttpResponse) {
        console.info('Mocking response for url : ' + requestPath);
        console.info('request : ' + JSON.stringify(req));
        console.info('response : ' + JSON.stringify(mockHttpResponse));
        return this.getMockedResponseObservable(this.getMutableCloneOfMockResponse(mockHttpResponse));
      }
    }
    return next.handle(req);
  }

  isMockingActive(): boolean {
    return !this._envService.production && this._envService.mock;
  }

  getMockedResponseObservable(mockResponse: MockHttpResponse): Observable<HttpEvent<any>> {
    return of(new HttpResponse(mockResponse));
  }

  getResponseFromMockedMap(reqUrl: string): MockHttpResponse | null {
    for (const [regex, mockResponse] of urlMockResponseMap.entries()) {
      const res = regex.exec(reqUrl);
      if (res) {
        return mockResponse;
      }
    }
    return null;
  }

  getMutableCloneOfMockResponse(mockResponse: MockHttpResponse): MockHttpResponse {
    return JSON.parse(JSON.stringify(mockResponse));
  }
}
