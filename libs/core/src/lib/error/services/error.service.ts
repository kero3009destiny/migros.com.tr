import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';

import { UserDTO } from '@migroscomtr/sanalmarket-angular';

import { UserService } from '../../services/user/user.service';
import { ErrorContextModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  user: UserDTO;
  constructor(private _injector: Injector, private _userService: UserService) {
    this.subscribeToUserService();
  }

  subscribeToUserService() {
    this._userService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  getClientMessage(error: Error): string {
    if (!navigator.onLine) {
      return 'Internet bağlantısı kurulamadı';
    }
    return error.message ? error.message : error.toString();
  }

  getClientStack(error: Error): ErrorContextModel {
    return this.addContextInfo(error);
  }

  getServerMessage(error: HttpErrorResponse): string {
    return error.statusText;
  }

  getServerStack(error: HttpErrorResponse): ErrorContextModel {
    return this.addContextInfo(error);
  }

  addContextInfo(error: any) {
    // All the context details that you want (usually coming from other services; Constants, UserService...)
    const name = error.name || null;
    const user = this.user;
    const time = new Date().getTime();
    const id = `${user ? user.id : 'anonymous'}-${time}`;
    const location = this._injector.get(LocationStrategy) || '/';
    const url = location instanceof PathLocationStrategy ? location.path() : '';
    const status = error.status || null;
    const message = error.message || error.toString();
    const stack = error instanceof HttpErrorResponse ? null : error;

    return { name, user, time, id, url, status, message, stack };
  }
}
