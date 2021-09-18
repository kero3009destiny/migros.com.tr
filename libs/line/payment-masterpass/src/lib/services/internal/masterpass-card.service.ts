import { Injectable, OnDestroy } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';

import { filter } from 'rxjs/operators';

import { combineLatest, ReplaySubject, Subscription } from 'rxjs';

import { MasterPassClientInterface, UserStatus } from '../../models';
import { isSuccessful } from '../../utils';

import { MasterpassStateService } from './masterpass-state.service';

declare const MFS: MasterPassClientInterface;

@Injectable({
  providedIn: 'root',
})
export class MasterpassCardService implements OnDestroy {
  private _subscription = new Subscription();

  constructor(
    private _masterpassStateService: MasterpassStateService,
    private _loadingIndicatorService: LoadingIndicatorService
  ) {}

  onInit() {
    this._subscription.add(this._list());
    this._subscription.add(this._remove());
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private _list() {
    return combineLatest([
      this._masterpassStateService.getToken(),
      this._masterpassStateService.getPhoneNumber(),
      this._masterpassStateService.getStatus(),
    ])
      .pipe(
        filter(([token]) => !!token),
        filter(([, phoneNumber]) => !!phoneNumber),
        filter(([, , status]) => status === UserStatus.LINKED)
      )
      .subscribe(([token, phoneNumber]) => {
        this.doListCards(phoneNumber, token);
      });
  }

  private doListCards(phoneNumber, token) {
    this._loadingIndicatorService.start();

    MFS.listCards(phoneNumber, token, (statusCode, response) => {
      if (!isSuccessful(response)) {
        if (response.responseCode === '1078') {
          this._masterpassStateService.setStatus(UserStatus.UPDATE_NEEDED);
        } else {
          this._masterpassStateService.setError(response.responseDescription);
        }
        this._loadingIndicatorService.stop();
        return;
      }
      this._masterpassStateService.setCards(response.cards);
      this._loadingIndicatorService.stop();
    });
  }

  private _remove() {
    return combineLatest([
      this._masterpassStateService.getToken(),
      this._masterpassStateService.getPhoneNumber(),
      this._masterpassStateService.getRemoveInputs(),
      this._masterpassStateService.getCards(),
    ])
      .pipe(
        filter(([token]) => !!token),
        filter(([, phoneNumber]) => !!phoneNumber),
        filter(([, , removeInputs]) => removeInputs.length !== 0),
        filter(([, , , cards]) => cards.length !== 0)
      )
      .subscribe(([token, phoneNumber, removeInputs, cards]) => {
        this._loadingIndicatorService.start();
        removeInputs.find((el) => el.name === 'token').value = token;
        removeInputs.find((el) => el.name === 'msisdn').value = phoneNumber;
        MFS.deleteCard(removeInputs, (statusCode, response) => {
          if (!isSuccessful(response)) {
            this._masterpassStateService.setError(response.responseDescription);
            this._loadingIndicatorService.stop();
            return;
          }
          this._masterpassStateService.setSelectedCard(null);
          if (cards.length === 1) {
            this._masterpassStateService.setCards([]);
            this._masterpassStateService.setStatus(UserStatus.GUEST);
            this._masterpassStateService.setRemoveInputs([]);
            this._loadingIndicatorService.stop();
            return;
          }
          this._masterpassStateService.setRemoveInputs([]);
          this.doListCards(phoneNumber, token);
          this._loadingIndicatorService.stop();
        });
      });
  }
}
