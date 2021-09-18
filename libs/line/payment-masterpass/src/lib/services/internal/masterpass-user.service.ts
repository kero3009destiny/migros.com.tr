import { Injectable, OnDestroy } from '@angular/core';

import { LoadingIndicatorService, UserService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';

import { catchError, distinct, filter, finalize, map } from 'rxjs/operators';

import { PaymentRestControllerService } from '@migroscomtr/sanalmarket-angular';
import { combineLatest, Observable, Subscription, throwError } from 'rxjs';

import { MasterPassClientInterface, UserStatus, ValidationStatus } from '../../models';
import {
  hasRegisteredCardInMasterpassAccount,
  isMasterpassAccountBlocked,
  isMasterpassAccountLinked,
  isSuccessful,
} from '../../utils';

import { MasterpassStateService } from './masterpass-state.service';

declare const MFS: MasterPassClientInterface;

@Injectable({
  providedIn: 'root',
})
export class MasterpassUserService implements OnDestroy {
  master = 'MASTER';
  id: Observable<string>;
  private _subscription = new Subscription();

  constructor(
    private _paymentRestController: PaymentRestControllerService,
    private _masterpassStateService: MasterpassStateService,
    private _userService: UserService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _envService: EnvService
  ) {}

  onInit() {
    this._subscription.add(this._check());
    this._subscription.add(this._linkUser());
    this._subscription.add(this._validate());
    this._subscription.add(this._register());
    this._subscription.add(this._getUserInfo());
    this._subscription.add(this._authenticate());
    this._subscription.add(this._updateUser());
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private _getUserInfo() {
    return this._userService.user$.subscribe((user) => {
      this._masterpassStateService.setPhoneNumber('90' + user.phoneNumber);
      this._masterpassStateService.setMasterId(user.masterId.toString());
      this._masterpassStateService.setUserId(user.id.toString());
    });
  }

  private _authenticate() {
    this._loadingIndicatorService.start();
    return this._paymentRestController
      .getMasterPassToken(this._envService.masterpassUserMode as 'MASTER' | 'USER')
      .pipe(
        catchError((error) => throwError(error)),
        map((authResponse) => authResponse.data.token),
        finalize(() => this._loadingIndicatorService.stop()),
        distinct()
      )
      .subscribe((token) => {
        this._masterpassStateService.setToken(token);
      });
  }

  private _check() {
    return combineLatest([
      this._masterpassStateService.getToken(),
      this._masterpassStateService.getPhoneNumber(),
      this._masterpassStateService.getCheckInputs(),
    ])
      .pipe(
        filter(([token]) => !!token),
        filter(([, phoneNumber]) => !!phoneNumber),
        filter(([, , checkInputs]) => checkInputs.length !== 0)
      )
      .subscribe(([token, phoneNumber, checkInputs]) => {
        this._loadingIndicatorService.start();
        // stop loading in case of mpass request not completes
        // TODO - emin - remove this loadingStopped logic after loading service starts using keys
        let loadingStopped = false;
        setTimeout(() => {
          if (!loadingStopped) {
            this._loadingIndicatorService.stop();
            loadingStopped = true;
          }
        }, 3000);
        checkInputs.find((el) => el.name === 'token').value = token;
        checkInputs.find((el) => el.name === 'userId').value = phoneNumber;
        MFS.checkMasterPass(checkInputs, (status, response) => {
          if (!isSuccessful(response)) {
            this._masterpassStateService.setError(response.responseDescription);
          }
          if (!loadingStopped) {
            this._loadingIndicatorService.stop();
            loadingStopped = true;
          }
          //
          const { accountStatus } = response;
          if (isMasterpassAccountBlocked(accountStatus)) {
            this._masterpassStateService.setStatus(UserStatus.BLOCKED);
            this._masterpassStateService.setError(response.responseDescription);
            return;
          }
          if (isMasterpassAccountLinked(accountStatus)) {
            this._masterpassStateService.setStatus(UserStatus.LINKED);
            return;
          }
          if (hasRegisteredCardInMasterpassAccount(accountStatus)) {
            this._masterpassStateService.setStatus(UserStatus.LINKABLE);
            return;
          }
          this._masterpassStateService.setStatus(UserStatus.GUEST);
        });
      });
  }

  private _linkUser() {
    return combineLatest([
      this._masterpassStateService.getToken(),
      this._masterpassStateService.getPhoneNumber(),
      this._masterpassStateService.getLinkInputs(),
    ])
      .pipe(
        filter(([token]) => !!token),
        filter(([, phoneNumber]) => !!phoneNumber),
        filter(([, , linkInputs]) => linkInputs.length !== 0)
      )
      .subscribe(([token, phoneNumber, linkInputs]) => {
        this._loadingIndicatorService.start();
        linkInputs.find((el) => el.name === 'token').value = token;
        linkInputs.find((el) => el.name === 'msisdn').value = phoneNumber;
        MFS.linkCardToClient(linkInputs, (status, response) => {
          if (isSuccessful(response)) {
            this._masterpassStateService.setStatus(UserStatus.LINKED);
            this._masterpassStateService.setLinkInputs([]);
            this._loadingIndicatorService.stop();
            return;
          }
          this._checkResponseCode(response);
          this._loadingIndicatorService.stop();
        });
      });
  }

  private _validate() {
    return combineLatest([this._masterpassStateService.getValidationInputs()])
      .pipe(filter(([validationInputs]) => validationInputs.length !== 0))
      .subscribe(([validationInputs]) => {
        this._loadingIndicatorService.start();

        MFS.validateTransaction(validationInputs, (status, response) => {
          if (isSuccessful(response)) {
            this._masterpassStateService.setStatus(UserStatus.LINKED);
            this._masterpassStateService.setValidationStatus(ValidationStatus.SUCCESSFUL);
            this._masterpassStateService.setValidationResponse(response);
            this._resetInputs();
            this._loadingIndicatorService.stop();
            return;
          }
          this._checkResponseCode(response);
          this._loadingIndicatorService.stop();
        });
      });
  }

  private _register() {
    return combineLatest([
      this._masterpassStateService.getToken(),
      this._masterpassStateService.getPhoneNumber(),
      this._masterpassStateService.getRegisterInputs(),
    ])
      .pipe(
        filter(([token]) => !!token),
        filter(([, phoneNumber]) => !!phoneNumber),
        filter(([, , registerInputs]) => registerInputs.length > 0)
      )
      .subscribe(([token, phoneNumber, registerInputs]) => {
        this._loadingIndicatorService.start();
        registerInputs.find((el) => el.name === 'token').value = token;
        registerInputs.find((el) => el.name === 'msisdn').value = phoneNumber;
        MFS.register(registerInputs, (status, response) => {
          if (isSuccessful(response)) {
            this._masterpassStateService.setSelectedCard(null);
            this._masterpassStateService.setStatus(UserStatus.LINKED);
            this._masterpassStateService.setRegisterInputs([]);
            this._loadingIndicatorService.stop();
            return;
          }
          this._checkResponseCode(response);
          this._loadingIndicatorService.stop();
        });
      });
  }

  private _updateUser(): Subscription {
    //Sm uses masterId, mc/td uses userid. User mode should be checked
    this.id =
      this._envService.masterpassUserMode === this.master
        ? this._masterpassStateService.getMasterId()
        : this._masterpassStateService.getUserId();

    return combineLatest([
      this._masterpassStateService.getToken(),
      this._masterpassStateService.getPhoneNumber(),
      this.id,
      this._masterpassStateService.getUpdateUserInputs(),
      this._masterpassStateService.getStatus(),
    ])
      .pipe(
        filter(([token]) => !!token),
        filter(([, phoneNumber]) => !!phoneNumber),
        filter(([, , masterId]) => !!masterId),
        filter(([, , , updateUserInputs]) => updateUserInputs.length > 0),
        filter(([, , , , status]) => status === UserStatus.UPDATE_APPROVED)
      )
      .subscribe(([token, phoneNumber, masterId, updateUserInputs]) => {
        updateUserInputs.find((el) => el.name === 'token').value = token;
        updateUserInputs.find((el) => el.name === 'theNewValue').value = masterId;
        updateUserInputs.find((el) => el.name === 'msisdn').value = phoneNumber;
        updateUserInputs.find((el) => el.name === 'oldValue').value = '';
        updateUserInputs.find((el) => el.name === 'valueType').value = 'USER_ID';
        MFS.updateUser(updateUserInputs, (statusCode, response) => {
          if (isSuccessful(response)) {
            this._masterpassStateService.setStatus(UserStatus.LINKED);
            this._masterpassStateService.setUpdateUserInputs([]);
            return;
          }
          this._masterpassStateService.setUpdateUserInputs([]);
          this._masterpassStateService.setStatus(UserStatus.GUEST);
          this._checkResponseCode(response);
        });
      });
  }

  private _checkResponseCode = (response) => {
    const { responseCode, responseDescription } = response;
    if (responseCode === '5001') {
      this._masterpassStateService.setValidationStatus(ValidationStatus.BANK_VALIDATION);
      return;
    }
    if (responseCode === '5008') {
      this._masterpassStateService.setValidationStatus(ValidationStatus.MP_VALIDATION);
      return;
    }
    this._masterpassStateService.setError(responseDescription);
  };

  private _resetInputs = () => {
    this._masterpassStateService.setLinkInputs([]);
    this._masterpassStateService.setRegisterInputs([]);
    this._masterpassStateService.setRemoveInputs([]);
    this._masterpassStateService.setValidationInputs([]);
  };
}
