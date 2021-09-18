import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

import { Card, PurchaseStatus, Response, UserStatus, ValidationStatus } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class MasterpassStateService {
  private _checkoutId = new ReplaySubject<number>(1);

  private _cards = new BehaviorSubject<Card[]>([]);

  private _selectedCard = new ReplaySubject<Card>(1);

  private _status = new ReplaySubject<UserStatus>(1);

  private _phoneNumber = new ReplaySubject<string>(1);

  private _masterId = new ReplaySubject<string>(1);

  private _userId = new ReplaySubject<string>(1);

  private _token = new ReplaySubject<string>(1);

  private _purchaseStatus = new BehaviorSubject<PurchaseStatus>(PurchaseStatus.INIT);

  private _purchaseInputs = new BehaviorSubject<HTMLInputElement[]>([]);

  private _linkInputs = new BehaviorSubject<HTMLInputElement[]>([]);

  private _checkInputs = new BehaviorSubject<HTMLInputElement[]>([]);

  private _validationInputs = new BehaviorSubject<HTMLInputElement[]>([]);

  private _validationStatus = new BehaviorSubject<ValidationStatus>(ValidationStatus.INIT);

  private _registerInputs = new BehaviorSubject<HTMLInputElement[]>([]);

  private _removeInputs = new BehaviorSubject<HTMLInputElement[]>([]);

  private _updateUserInputs = new BehaviorSubject<HTMLInputElement[]>([]);

  private _agreements = new ReplaySubject<string>(1);

  private _validationResponse = new ReplaySubject<Response>(1);

  private _error = new ReplaySubject<string>(1);

  reset() {
    this._checkoutId.next(null);
    this._cards.next([]);
    this._selectedCard.next(null);
    this._status.next(null);
    this._purchaseStatus.next(PurchaseStatus.INIT);
    this._purchaseInputs.next([]);
    this._linkInputs.next([]);
    this._checkInputs.next([]);
    this._validationInputs.next([]);
    this._validationStatus.next(ValidationStatus.INIT);
    this._registerInputs.next([]);
    this._removeInputs.next([]);
    this._updateUserInputs.next([]);
    this._validationResponse.next(null);
    this._error.next(null);
  }

  getCheckoutId(): Observable<number> {
    return this._checkoutId.asObservable();
  }

  setCheckoutId(checkoutId: number): void {
    this._checkoutId.next(checkoutId);
  }

  getCards(): Observable<Card[]> {
    return this._cards.asObservable();
  }

  setCards(cards: Card[]): void {
    this._cards.next(cards);
  }

  getSelectedCard(): Observable<Card> {
    return this._selectedCard.asObservable();
  }

  setSelectedCard(selectedCard: Card): void {
    this._selectedCard.next(selectedCard);
  }

  getStatus(): Observable<UserStatus> {
    return this._status.asObservable();
  }

  setStatus(status: UserStatus): void {
    this._status.next(status);
  }

  getPhoneNumber(): Observable<string> {
    return this._phoneNumber.asObservable();
  }

  setPhoneNumber(phoneNumber: string): void {
    this._phoneNumber.next(phoneNumber);
  }

  getMasterId(): Observable<string> {
    return this._masterId.asObservable();
  }

  setMasterId(id: string): void {
    this._masterId.next(id);
  }

  getUserId(): Observable<string> {
    return this._userId.asObservable();
  }

  setUserId(id: string): void {
    this._userId.next(id);
  }

  getToken(): Observable<string> {
    return this._token.asObservable();
  }

  setToken(token: string): void {
    this._token.next(token);
  }

  getPurchaseStatus(): Observable<PurchaseStatus> {
    return this._purchaseStatus.asObservable();
  }

  setPurchaseStatus(purchaseStatus: PurchaseStatus): void {
    this._purchaseStatus.next(purchaseStatus);
  }

  getPurchaseInputs(): Observable<HTMLInputElement[]> {
    return this._purchaseInputs.asObservable();
  }

  setPurchaseInputs(purchaseInputs: HTMLInputElement[]): void {
    this._purchaseInputs.next(purchaseInputs);
  }

  getLinkInputs(): Observable<HTMLInputElement[]> {
    return this._linkInputs.asObservable();
  }

  setLinkInputs(linkInputs: HTMLInputElement[]): void {
    this._linkInputs.next(linkInputs);
  }

  getCheckInputs(): Observable<HTMLInputElement[]> {
    return this._checkInputs.asObservable();
  }

  setCheckInputs(checkInputs: HTMLInputElement[]): void {
    this._checkInputs.next(checkInputs);
  }

  getValidationInputs(): Observable<HTMLInputElement[]> {
    return this._validationInputs.asObservable();
  }

  setValidationInputs(validationInputs: HTMLInputElement[]): void {
    this._validationInputs.next(validationInputs);
  }

  getValidationStatus(): Observable<ValidationStatus> {
    return this._validationStatus.asObservable();
  }

  setValidationStatus(validationStatus: ValidationStatus): void {
    this._validationStatus.next(validationStatus);
  }

  getRegisterInputs(): Observable<HTMLInputElement[]> {
    return this._registerInputs.asObservable();
  }

  setRegisterInputs(registerInputs: HTMLInputElement[]): void {
    this._registerInputs.next(registerInputs);
  }

  getRemoveInputs(): Observable<HTMLInputElement[]> {
    return this._removeInputs.asObservable();
  }

  setRemoveInputs(removeInputs: HTMLInputElement[]): void {
    this._removeInputs.next(removeInputs);
  }

  getUpdateUserInputs(): Observable<HTMLInputElement[]> {
    return this._updateUserInputs.asObservable();
  }

  setUpdateUserInputs(updateUserInputs: HTMLInputElement[]): void {
    this._updateUserInputs.next(updateUserInputs);
  }

  getAgreements(): Observable<string> {
    return this._agreements.asObservable();
  }

  setAgreements(agreements: string): void {
    this._agreements.next(agreements);
  }

  getValidationResponse(): Observable<Response> {
    return this._validationResponse.asObservable();
  }

  setValidationResponse(response: Response): void {
    this._validationResponse.next(response);
  }

  getError(): Observable<string> {
    return this._error.asObservable();
  }

  setError(error: string): void {
    this._error.next(error);
  }
}
