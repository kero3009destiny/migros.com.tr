import { Injectable, OnDestroy } from '@angular/core';

import { LoggingService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';

import { filter } from 'rxjs/operators';

import { Observable, Subscription } from 'rxjs';

import { Card, UserStatus } from '../models';

import {
  MasterpassAgreementService,
  MasterpassCardService,
  MasterpassOtpService,
  MasterpassStateService,
  MasterpassUserService,
} from './internal';

@Injectable()
export class MasterpassService implements OnDestroy {
  private _showErrorSubscription: Subscription;
  private _initialized = false;

  constructor(
    private _masterpassAgreementService: MasterpassAgreementService,
    private _masterpassCardService: MasterpassCardService,
    private _masterpassOtpService: MasterpassOtpService,
    private _masterpassStateService: MasterpassStateService,
    private _masterpassUserService: MasterpassUserService,
    private _envService: EnvService,
    private _loggingService: LoggingService
  ) {
    this._showErrorSubscription = this._showError();
  }

  onInit() {
    if (!this._initialized) {
      this._masterpassUserService.onInit();
      this._masterpassCardService.onInit();
      this._initialized = true;
    }
  }

  ngOnDestroy() {
    if (this._showErrorSubscription) {
      this._showErrorSubscription.unsubscribe();
    }
  }

  reset() {
    this._masterpassStateService.reset();
  }

  getCards(): Observable<Card[]> {
    return this._masterpassStateService.getCards();
  }

  getSelectedCard(): Observable<Card> {
    return this._masterpassStateService.getSelectedCard();
  }

  getStatus(): Observable<UserStatus> {
    return this._masterpassStateService.getStatus();
  }

  getRegisterInputs(): Observable<HTMLInputElement[]> {
    return this._masterpassStateService.getRegisterInputs();
  }

  getUpdateUserInputs(): Observable<HTMLInputElement[]> {
    return this._masterpassStateService.getUpdateUserInputs();
  }

  authenticate(checkInputs: HTMLInputElement[]) {
    this._masterpassStateService.setCheckInputs(checkInputs);
  }

  linkUser(linkInputs: HTMLInputElement[]) {
    this._masterpassStateService.setLinkInputs(linkInputs);
  }

  validate(validationInputs: HTMLInputElement[]) {
    this._masterpassStateService.setValidationInputs(validationInputs);
  }

  register(registerInputs: HTMLInputElement[]) {
    this._masterpassStateService.setRegisterInputs(registerInputs);
  }

  removeCard(removeInputs: HTMLInputElement[]) {
    this._masterpassStateService.setRemoveInputs(removeInputs);
  }

  updateUser(updateUserInputs: HTMLInputElement[]): void {
    this._masterpassStateService.setUpdateUserInputs(updateUserInputs);
  }

  updateSelectedCard(card: Card) {
    this._masterpassStateService.setSelectedCard(card);
  }

  updatePurchaseInputs(purchaseInputs: HTMLInputElement[]) {
    this._masterpassStateService.setPurchaseInputs(purchaseInputs);
  }

  updateCheckoutId(checkoutId: number) {
    this._masterpassStateService.setCheckoutId(checkoutId);
  }

  getAgreements() {
    return this._masterpassStateService.getAgreements();
  }

  private _showError() {
    return this._masterpassStateService
      .getError()
      .pipe(filter((error) => !!error))
      .subscribe((error) => {
        this._loggingService.logError({ title: 'Masterpass Kullanıcı İşlemleri', message: error });
      });
  }
}
