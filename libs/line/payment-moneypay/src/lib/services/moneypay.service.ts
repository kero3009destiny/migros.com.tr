import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { AgreementDialogComponent, LoadingIndicatorService } from '@fe-commerce/core';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { MainPaymentService } from '@fe-commerce/line-payment';
import { SidePaymentFacade } from '@fe-commerce/line-payment-side';

import { BehaviorSubject, combineLatest, Observable, ReplaySubject, Subscription } from 'rxjs';
import { filter, finalize, map, startWith, tap } from 'rxjs/operators';

import {
  BkmTokenFormBean,
  CheckoutRestControllerService,
  MoneyPayAgreementInfo, MoneyPayPaymentFormBean,
  MoneyPayPaymentOption,
  MoneyPayRestControllerService,
  ServiceResponse,
  ServiceResponsestring
} from "@migroscomtr/sanalmarket-angular";

import {
  MoneyPayAccountStatus,
  MoneyPayWalletStatus,
  NOT_OTP_VERIFIED,
  NOT_REGISTERED_ERROR,
  PaymentStatusDTO,
} from '../models';
import { MoneypayOtpDialogService } from './moneypay-otp-dialog.service';
import PaymentTypeEnum = BkmTokenFormBean.PaymentTypeEnum;

@Injectable({
  providedIn: 'root',
})
export class MoneypayService implements MainPaymentService<MoneyPayPaymentFormBean> {
  readonly MONEY_PAY_ALTERNATIVE_PAYMENT_OPTIONS = [PaymentTypeEnum.Loan];
  readonly MONEY_PAY_PAYMENT_OPTIONS = [PaymentTypeEnum.Wallet, ...this.MONEY_PAY_ALTERNATIVE_PAYMENT_OPTIONS];

  private _accessToken: string;
  private _userToken: string;
  private _transactionId: string;
  private _moneyPayAccountStatus$: ReplaySubject<MoneyPayAccountStatus> = new ReplaySubject(1);
  private _walletStatus$: ReplaySubject<MoneyPayWalletStatus> = new ReplaySubject(1);
  private _selectedPaymentOption: PaymentTypeEnum;
  private _mainPaymentAmount$: Observable<number> = new BehaviorSubject<number>(0);
  private _mainPaymentAmount: number;

  constructor(
    private _moneyPayApi: MoneyPayRestControllerService,
    private _ngZone: NgZone,
    private _checkoutService: CheckoutService,
    private _checkoutApi: CheckoutRestControllerService,
    private _otpService: MoneypayOtpDialogService,
    private _loadingService: LoadingIndicatorService,
    private _agreementDialog: MatDialog,
    private _sidePaymentService: SidePaymentFacade
  ) {
    this.subscribeOnAccountStatus();
    this.subscribeToMainPaymentAmount();
  }

  initMoneyPayService(): void {
    this.fetchAccessToken();
  }

  getAccessToken(): string {
    return this._accessToken;
  }

  getUserToken(): string {
    return this._userToken;
  }

  getMoneyPayAccountStatus$(): Observable<MoneyPayAccountStatus> {
    return this._moneyPayAccountStatus$.asObservable();
  }

  getWalletStatus$(): Observable<MoneyPayWalletStatus> {
    return combineLatest([this._walletStatus$, this._mainPaymentAmount$.pipe(startWith(0))]).pipe(
      map(([walletStatus, mainPaymentAmount]) => {
        return this.fillWalletStatusSufficiency(walletStatus, mainPaymentAmount);
      })
    );
  }

  private fillWalletStatusSufficiency(
    walletStatus: MoneyPayWalletStatus,
    mainPaymentAmount: number
  ): MoneyPayWalletStatus {
    const walletInsufficient = walletStatus.walletBalance < mainPaymentAmount;
    const walletAvailable = walletStatus.walletAvailable && !walletInsufficient;
    const alternativePayments = walletStatus.alternativePayments
      .filter((ps) => !!ps)
      .map((ps) => {
        const insufficient = ps.balance < mainPaymentAmount;
        const available = ps.available && !insufficient;
        return { ...ps, insufficient, available };
      });
    return { ...walletStatus, walletInsufficient, walletAvailable, alternativePayments };
  }

  isUserMoneyPayRegistered$(): Observable<boolean> {
    const registeredStatuses = [MoneyPayAccountStatus.VERIFIED, MoneyPayAccountStatus.NOT_OTP_VERIFIED];
    const notRegisteredStatuses = [MoneyPayAccountStatus.NOT_REGISTERED];
    return this._moneyPayAccountStatus$.pipe(
      filter((status) => [...registeredStatuses, ...notRegisteredStatuses].includes(status)),
      map((accountStatus) => {
        return registeredStatuses.includes(accountStatus);
      })
    );
  }

  isPhoneNumberVerified$(): Observable<boolean> {
    const verifiedStatuses = [MoneyPayAccountStatus.VERIFIED];
    const unverifiedStatuses = [MoneyPayAccountStatus.NOT_REGISTERED, MoneyPayAccountStatus.NOT_OTP_VERIFIED];
    return this._moneyPayAccountStatus$.pipe(
      filter((status) => [...verifiedStatuses, ...unverifiedStatuses].includes(status)),
      map((accountStatus) => {
        return verifiedStatuses.includes(accountStatus);
      })
    );
  }

  private fetchAccessToken() {
    this._moneyPayApi
      .token()
      .pipe(
        filter((response) => response.successful && !!response.data),
        map((response): string => response.data)
      )
      .subscribe((accessToken) => {
        this._accessToken = accessToken;
        this._ngZone.run(() => {
          this.checkMoneyPayUser();
        });
      });
  }

  private checkMoneyPayUser() {
    this._moneyPayApi.tokenByPhoneNumber({ token: this._accessToken }).subscribe((response) => {
      if (response.successful && !!response.data) {
        this._userToken = response.data;
        this._moneyPayAccountStatus$.next(MoneyPayAccountStatus.VERIFIED);
      } else if (response.errorCode === NOT_REGISTERED_ERROR) {
        this._moneyPayAccountStatus$.next(MoneyPayAccountStatus.NOT_REGISTERED);
      } else if (response.errorCode === NOT_OTP_VERIFIED) {
        this._moneyPayAccountStatus$.next(MoneyPayAccountStatus.NOT_OTP_VERIFIED);
      } else {
        throw new Error(`Unexpected check money pay user response: ${response}`);
      }
    });
  }

  private fetchWalletStatus() {
    this._moneyPayApi
      .paymentOptions({
        token: this._accessToken,
        userToken: this._userToken,
        amount: this._mainPaymentAmount,
      })
      .pipe(
        filter((response) => response.successful),
        map((response) => response.data),
        finalize(() => {
          this._loadingService.stop();
        })
      )
      .subscribe((paymentOptions: MoneyPayPaymentOption[]) => {
        this._walletStatus$.next(this.processPaymentOptions(paymentOptions));
      });
  }

  processPaymentOptions(paymentOptions: MoneyPayPaymentOption[]): MoneyPayWalletStatus {
    const walletStatus = paymentOptions.find((ps) => ps?.paymentType === 'WALLET');
    if (!walletStatus) {
      throw new Error('Wallet payment option cannot be fetched for verified Money Pay user.');
    }
    return {
      walletBalance: walletStatus.balance,
      walletAvailable: walletStatus.available,
      walletDisableDesc: walletStatus.disableDesc,
      alternativePayments: paymentOptions.filter((ps) => ps?.paymentType !== 'WALLET') as PaymentStatusDTO[],
    };
  }

  selectPaymentOption(paymentOption: PaymentTypeEnum) {
    if (this.MONEY_PAY_PAYMENT_OPTIONS.includes(paymentOption)) {
      this._selectedPaymentOption = paymentOption;
    } else {
      throw new Error(`Trying to select payment option MoneyPay service does not have ${paymentOption}`);
    }
  }

  purchase(checkoutId: number, bean: MoneyPayPaymentFormBean): Subscription {
    bean = {
      paymentType: this._selectedPaymentOption,
      accessToken: this._accessToken,
      userToken: this._userToken,
      ...bean,
    };

    if (this.MONEY_PAY_ALTERNATIVE_PAYMENT_OPTIONS.includes(this._selectedPaymentOption)) {
      this._loadingService.start();
      return this._moneyPayApi
        .agreement({ amount: this._mainPaymentAmount, token: this._accessToken, userToken: this._userToken })
        .pipe(
          finalize(() => {
            this._loadingService.stop();
          }),
          filter((response) => response.successful),
          map((response) => response.data)
        )
        .subscribe((data: MoneyPayAgreementInfo) => {
          this._transactionId = data.transactionId;
          this._ngZone.run(() => {
            const dialogRef = this._agreementDialog.open(AgreementDialogComponent, {
              data: {
                html: data.agreement,
                inDialogApproval: {
                  text: 'Okudum, Onaylıyorum',
                },
              },
              autoFocus: false,
            });
            dialogRef
              .afterClosed()
              .pipe(filter((isAccepted) => !!isAccepted))
              .subscribe(() => {
                this._ngZone.run(() => {
                  if (!this._transactionId) {
                    throw new Error('Trying to make a money pay loan payment but no transactionId exists!');
                  }
                  this.doPurchase(checkoutId, { ...bean, transactionId: this._transactionId });
                });
              });
          });
        });
    } else {
      return this.doPurchase(checkoutId, bean);
    }
  }

  private doPurchase(checkoutId: number, bean: MoneyPayPaymentFormBean): Subscription {
    this._loadingService.start();
    return this._checkoutApi
      .purchaseMoneyPay(checkoutId, bean)
      .pipe(
        filter((response) => response.successful),
        map((response) => response.data),
        finalize(() => {
          this._loadingService.stop();
        })
      )
      .subscribe(() => {
        this._checkoutService.updateCheckoutStatus({ success: true });
      });
  }

  startOtp(): void {
    this._loadingService.start();
    this.sendOtp$()
      .pipe(
        finalize(() => {
          this._loadingService.stop();
        })
      )
      .subscribe(() => {
        this._ngZone.run(() => {
          this._otpService
            .getUserVerified$()
            .pipe(filter((userVerified) => !!userVerified))
            .subscribe(() => {
              this._moneyPayAccountStatus$.next(MoneyPayAccountStatus.VERIFIED);
            });
          this._otpService.startOTP();
        });
      });
  }

  sendOtp$(): Observable<ServiceResponse> {
    return this._moneyPayApi.sendOtp({ token: this._accessToken });
  }

  verifyOtp$(code: string): Observable<ServiceResponsestring> {
    return this._moneyPayApi.verifyOtp({ otpCode: code, token: this._accessToken }).pipe(
      tap((response) => {
        this._userToken = response.data;
      })
    );
  }

  private subscribeOnAccountStatus() {
    this.getMoneyPayAccountStatus$().subscribe((status) => {
      if (status === MoneyPayAccountStatus.VERIFIED) {
        this._ngZone.run(() => {
          this.fetchWalletStatus();
        });
      }
    });
  }

  private subscribeToMainPaymentAmount(): void {
    this._mainPaymentAmount$ = this._checkoutService
      .getCalculatedCheckoutRevenueToBePaid()
      .pipe(filter((value) => Number.isSafeInteger(value)));
    this._mainPaymentAmount$.subscribe((value) => {
      this._mainPaymentAmount = value;
    });
  }

  getMoneyPayUserMembershipStatus$(): Observable<[boolean, boolean]> {
    return combineLatest([this.isUserMoneyPayRegistered$(), this.isPhoneNumberVerified$()]);
  }
}
