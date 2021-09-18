import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { PhoneVerifyService } from '@fe-commerce/auth';
import { LoadingIndicatorService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MoneyPayPaymentFormBean, OtpRegistrationControllerV2Service } from '@migroscomtr/sanalmarket-angular';

import { MoneyPayWalletStatus } from '../../models';
import { MoneypayService } from '../../services';
import PaymentTypeEnum = MoneyPayPaymentFormBean.PaymentTypeEnum;

const enum MoneyPayWrapperContentType {
  REGISTERED_UNVERIFIED = 'REGISTERED_UNVERIFIED',
  VERIFIED = 'VERIFIED',
  UNREGISTERED = 'UNREGISTERED',
  LOADING = 'LOADING',
}

@Component({
  selector: 'fe-money-pay',
  templateUrl: './money-pay.component.html',
  styleUrls: ['./money-pay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneyPayComponent implements OnInit {
  private _currentContent$: BehaviorSubject<MoneyPayWrapperContentType> = new BehaviorSubject(
    MoneyPayWrapperContentType.LOADING
  );
  private _walletStatus: MoneyPayWalletStatus;
  private _walletStatusAvailable$: BehaviorSubject<boolean | null> = new BehaviorSubject(null);

  @Input() userPhoneNumber: string;
  @Input() closedPayments: PaymentTypeEnum[] = [];
  @Output() selectedPaymentMethod = new EventEmitter<PaymentTypeEnum>();

  constructor(
    private _registrationService: OtpRegistrationControllerV2Service,
    private _loadingService: LoadingIndicatorService,
    private _phoneVerifyService: PhoneVerifyService,
    private _httpClient: HttpClient,
    private _envService: EnvService,
    private _moneyPayService: MoneypayService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._subscribeToLoadingState();
    this.subscribeToUserStatus();
    this.subscribeToWalletStatus();
    this._moneyPayService.initMoneyPayService();
  }

  subscribeToUserStatus(): void {
    this._moneyPayService.getMoneyPayUserMembershipStatus$().subscribe(([isRegistered, isVerified]) => {
      if (isVerified) {
        this._currentContent$.next(MoneyPayWrapperContentType.VERIFIED);
      } else if (isRegistered) {
        this._currentContent$.next(MoneyPayWrapperContentType.REGISTERED_UNVERIFIED);
      } else {
        this._currentContent$.next(MoneyPayWrapperContentType.UNREGISTERED);
      }
      this._cdr.markForCheck();
    });
  }

  isCurrentContentRegisteredUnverified$(): Observable<boolean> {
    return this._currentContent$.pipe(map((c) => c === MoneyPayWrapperContentType.REGISTERED_UNVERIFIED));
  }

  isCurrentContentUnregistered$(): Observable<boolean> {
    return this._currentContent$.pipe(map((c) => c === MoneyPayWrapperContentType.UNREGISTERED));
  }

  isCurrentContentVerified$(): Observable<boolean> {
    return this._currentContent$.pipe(map((c) => c === MoneyPayWrapperContentType.VERIFIED));
  }

  isPaymentOptionsVisible$(): Observable<boolean> {
    return combineLatest([this.isCurrentContentVerified$(), this._walletStatusAvailable$]).pipe(
      map(([ccv, wsa]) => ccv && wsa)
    );
  }

  getWalletStatus(): MoneyPayWalletStatus {
    return this._walletStatus;
  }

  onSelectedPaymentMethod(paymentMethod: PaymentTypeEnum): void {
    this._moneyPayService.selectPaymentOption(paymentMethod);
    this.selectedPaymentMethod.emit(paymentMethod);
  }

  onClickVerifyPhoneNumber(): void {
    this._moneyPayService.startOtp();
  }

  private subscribeToWalletStatus(): void {
    this._moneyPayService.getWalletStatus$().subscribe((walletStatus) => {
      this._walletStatusAvailable$.next(!!walletStatus);
      this._walletStatus = walletStatus;
      this._cdr.markForCheck();
    });
  }

  onRegisterMoneyPayButtonClicked(): void {
    window.open('https://www.moneypay.com.tr/download.html');
  }

  private _subscribeToLoadingState(): void {
    combineLatest([this._currentContent$, this.isWalletStatusFetched$()]).subscribe(([contentState, walletFetched]) => {
      if (contentState === MoneyPayWrapperContentType.LOADING) {
        this._loadingService.start();
      } else if (contentState !== MoneyPayWrapperContentType.VERIFIED || walletFetched) {
        this._loadingService.stop();
      }
    });
  }

  private isWalletStatusFetched$(): Observable<boolean> {
    return this._walletStatusAvailable$.pipe(map((wsa) => wsa !== null));
  }
}
