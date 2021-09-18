import { Injectable, OnDestroy } from '@angular/core';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';
import { PaymentService } from '@fe-commerce/line-payment';
import { PaymentBalance } from '@fe-commerce/shared';

import { catchError, filter, finalize, map, switchMap, tap } from 'rxjs/operators';

import { combineLatest, EMPTY, ReplaySubject, Subscription } from 'rxjs';
import {
  CheckoutRestControllerService,
  MasterpassPaymentFormBean,
  OrderInfoDTO,
} from '@migroscomtr/sanalmarket-angular';

import { MasterPassClientInterface, PurchaseResponse, PurchaseStatus, TokenInfo, ValidationStatus } from '../../models';
import { isSuccessful } from '../../utils';

import { MasterpassStateService } from './masterpass-state.service';

declare const MFS: MasterPassClientInterface;

@Injectable({
  providedIn: 'root',
})
export class MasterpassPurchaseService implements PaymentService, OnDestroy {
  private _isSelected: boolean;
  private _paymentBalance?: PaymentBalance;
  private _paymentBody: MasterpassPaymentFormBean;

  private _clientPurchaseToken$ = new ReplaySubject<TokenInfo>(1);
  private _serverPurchaseToken$ = new ReplaySubject<string>(1);
  private _orderInfo$: ReplaySubject<OrderInfoDTO>;

  private _subscription = new Subscription();

  constructor(
    private _masterpassStateService: MasterpassStateService,
    private _checkoutRestService: CheckoutRestControllerService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _envService: EnvService
  ) {
    this._subscription.add(this._authenticatePurchase());
    this._subscription.add(this._purchaseClientSide());
    this._subscription.add(this._checkIfSelected());
    this._subscription.add(this._purchaseServerSide());
    this._subscription.add(this._listenToClientPurchaseValidation());
    this._subscription.add(this._listenToValidationStatus());
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  isSelected() {
    return this._isSelected;
  }

  pay(paymentBalance?: PaymentBalance) {
    this._orderInfo$ = new ReplaySubject<OrderInfoDTO>(1);
    this._paymentBalance = paymentBalance;
    this._masterpassStateService.setPurchaseStatus(PurchaseStatus.CLIENT_PURCHASE);
    return this._orderInfo$.asObservable();
  }

  private _checkIfSelected() {
    return this._masterpassStateService
      .getSelectedCard()
      .pipe(map((card) => !!card))
      .subscribe((isSelected) => {
        this._isSelected = isSelected;
      });
  }

  // First step

  private _authenticatePurchase() {
    return combineLatest([
      this._masterpassStateService.getCheckoutId(),
      this._masterpassStateService.getSelectedCard(),
      this._masterpassStateService.getPurchaseStatus(),
    ])
      .pipe(
        filter(([checkoutId]) => !!checkoutId),
        filter(([, selectedCard]) => !!selectedCard),
        filter(([, , status]) => status === PurchaseStatus.CLIENT_PURCHASE),
        tap(() => this._loadingIndicatorService.start()),
        switchMap(([checkoutId, selectedCard]) =>
          this._checkoutRestService
            .getMasterpassToken(checkoutId, {
              // @ts-expect-error //TODO Add missing fields
              mode: this._envService.masterpassUserMode,
              cardNumber: selectedCard.Value1,
              paymentType: 'MASTERPASS',
              ...this._paymentBalance,
            })
            .pipe(
              catchError((error) => this._onError(error)),
              map((response) => response.data),
              finalize(() => this._loadingIndicatorService.stop())
            )
        )
      )
      .subscribe((tokenInfo) => {
        this._clientPurchaseToken$.next(tokenInfo);
      });
  }

  // Second step

  private _purchaseClientSide() {
    return combineLatest([
      this._masterpassStateService.getPurchaseInputs(),
      this._masterpassStateService.getPhoneNumber(),
      this._clientPurchaseToken$,
      this._masterpassStateService.getSelectedCard(),
    ])
      .pipe(
        filter(([elements]) => elements.length !== 0),
        filter(([, phoneNumber]) => !!phoneNumber),
        filter(([, , tokenInfo]) => !!tokenInfo),
        filter(([, , , selectedCard]) => !!selectedCard)
      )
      .subscribe(([purchaseInputs, phoneNumber, tokenInfo, selectedCard]) => {
        this._loadingIndicatorService.start();
        purchaseInputs.find((el) => el.name === 'token').value = tokenInfo.token;
        purchaseInputs.find((el) => el.name === 'amount').value = tokenInfo.amount.toString();
        purchaseInputs.find((el) => el.name === 'orderNo').value = tokenInfo.posOrderId;
        //
        purchaseInputs.find((el) => el.name === 'listAccountName').value = selectedCard.Name;
        purchaseInputs.find((el) => el.name === 'msisdn').value = phoneNumber;
        //
        MFS.purchase(purchaseInputs, (status, response) => {
          if (isSuccessful(response)) {
            this._onClientPurchaseSuccess(response.token);
            this._loadingIndicatorService.stop();
            return;
          }
          const { responseCode, responseDescription, url3D } = response;
          if (responseCode === '5001') {
            this._masterpassStateService.setValidationStatus(ValidationStatus.BANK_VALIDATION);
            this._masterpassStateService.setValidationResponse(null);
            this._masterpassStateService.setPurchaseStatus(PurchaseStatus.CLIENT_VALIDATION);
            this._loadingIndicatorService.stop();
            return;
          }
          if (responseCode === '5010') {
            this._loadingIndicatorService.stop();
            window.location.assign(`${url3D}&returnUrl=${tokenInfo.callbackUrl}`);
            return;
          }
          this._masterpassStateService.setPurchaseStatus(PurchaseStatus.INIT);
          this._masterpassStateService.setError(responseDescription);
          this._loadingIndicatorService.stop();
        });
      });
  }

  // Third and final step

  private _purchaseServerSide() {
    return combineLatest([
      this._masterpassStateService.getCheckoutId(),
      this._masterpassStateService.getSelectedCard(),
      this._serverPurchaseToken$,
    ])
      .pipe(
        filter(([checkoutId]) => !!checkoutId),
        filter(([, selectedCard]) => !!selectedCard),
        filter(([, , token]) => !!token),
        switchMap(([checkoutId, selectedCard, token]) => {
          this._loadingIndicatorService.start();
          // @ts-expect-error //TODO Add missing fields
          this._paymentBody = {
            token,
            bankIca: selectedCard.BankIca,
            cardNumber: selectedCard.Value1,
            paymentType: 'MASTERPASS',
            ...this._paymentBalance,
          };
          return this._checkoutRestService.purchaseMasterpass(checkoutId, this._paymentBody).pipe(
            catchError((error) => this._onError(error)),
            map((response) => response.data),
            finalize(() => this._loadingIndicatorService.stop())
          );
        })
      )
      .subscribe((orderInfo) => {
        this._orderInfo$.next(orderInfo);
        this._orderInfo$.complete();
        this._resetState();
      });
  }

  private _listenToClientPurchaseValidation() {
    return combineLatest([
      this._masterpassStateService.getValidationResponse(),
      this._masterpassStateService.getPurchaseStatus(),
    ])
      .pipe(
        filter(([response]) => !!response),
        filter(([, status]) => status === PurchaseStatus.CLIENT_VALIDATION),
        map(([response]) => (response as PurchaseResponse).token),
        filter((token) => !!token)
      )
      .subscribe((token) => this._onClientPurchaseSuccess(token));
  }

  private _listenToValidationStatus() {
    return this._masterpassStateService
      .getValidationStatus()
      .pipe(filter((status) => status === ValidationStatus.UNSUCCESSFUL))
      .subscribe(() => {
        this._onError('Validasyon Basarisiz!');
      });
  }

  private _onClientPurchaseSuccess(token: string) {
    this._masterpassStateService.setPurchaseStatus(PurchaseStatus.SERVER_PURCHASE);
    this._serverPurchaseToken$.next(token);
  }

  private _onError = (error) => {
    this._resetState();
    this._orderInfo$ && this._orderInfo$.error(error);
    return EMPTY;
  };

  private _resetState = () => {
    this._masterpassStateService.setPurchaseStatus(PurchaseStatus.INIT);
    this._clientPurchaseToken$.next(null);
    this._serverPurchaseToken$.next(null);
  };
}
