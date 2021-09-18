import { Injectable } from '@angular/core';

import { Md5 } from 'ts-md5/dist/md5';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root',
})
export class SystemCookiesService {
  constructor(private _cookiesService: CookieService) {}

  saveUserCredentialsAsMd5({ email, userId }) {
    const md5 = new Md5();
    const hashedEmail = md5.appendStr(email).end();

    this._cookiesService.set('hmail', hashedEmail.toString());
    this._cookiesService.set('uid', userId);
  }

  removeUserCredentials() {
    this._cookiesService.delete('hmail', '/');
    this._cookiesService.delete('uid', '/');
  }
}
