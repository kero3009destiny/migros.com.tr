import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AgreementDialogComponent,
  AppStateService,
  GtmService,
  LoadingIndicatorService,
  LoggingService,
  PortfolioEnum,
  UserService,
} from '@fe-commerce/core';
import { BagType, CheckoutService, CheckoutSteps } from '@fe-commerce/line-checkout';
import { MainPaymentService, SidePaymentDiscountInfo } from '@fe-commerce/line-payment';
import { PaymentBkmService } from '@fe-commerce/line-payment-bkm';
import { CardInfoService, CardPaymentService } from '@fe-commerce/line-payment-credit-card';
import { MasterpassPaymentService } from '@fe-commerce/line-payment-masterpass';
import { MoneypayService } from '@fe-commerce/line-payment-moneypay';
import { PaymentOnDeliveryService } from '@fe-commerce/line-payment-on-delivery';
import { SidePaymentFacade } from '@fe-commerce/line-payment-side';
import { GarantiPayPaymentService } from '@fe-commerce/line/payment-garantipay';
import { AgreementsType, PaymentBalance, SubscriptionAbstract } from '@fe-commerce/shared';

import { distinctUntilChanged, distinctUntilKeyChanged, filter, map, takeUntil } from 'rxjs/operators';

import { CheckoutInfoDTO, CheckoutPaymentFormBean, InstallmentInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { MainPaymentComponent } from '../../../payment/components/main-payment/main-payment.component';
import { BagSelectorModalComponent } from '../../components/bag-selector-modal/bag-selector-modal.component';

import PaymentTypeEnum = CheckoutPaymentFormBean.PaymentTypeEnum;

@Component({
  selector: 'sm-delivery-payment',
  templateUrl: './delivery-payment.page.html',
  styleUrls: ['./delivery-payment.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DeliveryPaymentPage extends SubscriptionAbstract implements OnInit, OnDestroy {
  @ViewChild(MainPaymentComponent) mainPaymentComponent: MainPaymentComponent;

  agreementFormGroup: FormGroup;

  private checkoutId: number;
  private _checkoutInfo: CheckoutInfoDTO;
  private _isLoading = true;
  private _sidePayment: SidePaymentDiscountInfo;
  private _selectedPaymentMethod = PaymentTypeEnum.CreditCard;
  private _installment: number;
  private _bagSelectorModalRef: MatDialogRef<BagSelectorModalComponent>;
  private _selectedBagType = BagType.PLASTIC_BAG;
  private _paymentServiceMap: Map<PaymentTypeEnum, MainPaymentService>;
  private _callCenterIframeSrc: SafeResourceUrl;

  private readonly INSTALLMENT_ENABLED_PAYMENTS = [PaymentTypeEnum.CreditCard, PaymentTypeEnum.Masterpass];
  private readonly ONLINE_PAYMENTS = [
    PaymentTypeEnum.Masterpass,
    PaymentTypeEnum.GarantiPay,
    PaymentTypeEnum.Bkm,
    PaymentTypeEnum.CreditCard,
  ];
  private _installmentInfo: InstallmentInfoDTO;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _checkoutService: CheckoutService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _loggingService: LoggingService,
    private _sidePaymentService: SidePaymentFacade,
    private _matDialog: MatDialog,
    private _agreementDialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _gtmService: GtmService,
    private _userService: UserService,
    private _domSanitizer: DomSanitizer,
    private _appStateService: AppStateService,
    //
    private _onlinePaymentService: CardPaymentService,
    private _paymentBkmService: PaymentBkmService,
    private _masterpassPaymentService: MasterpassPaymentService,
    private _paymentOnDeliveryService: PaymentOnDeliveryService,
    private _garantiPayPaymentService: GarantiPayPaymentService,
    private _walletPaymentService: MoneypayService,
    private _cardInfoService: CardInfoService
  ) {
    super();
    this._paymentServiceMap = new Map<PaymentTypeEnum, MainPaymentService>([
      [PaymentTypeEnum.Bkm, _paymentBkmService],
      [PaymentTypeEnum.CreditCard, _onlinePaymentService],
      [PaymentTypeEnum.Masterpass, _masterpassPaymentService],
      [PaymentTypeEnum.CashOnDelivery, _paymentOnDeliveryService],
      [PaymentTypeEnum.CreditCardOnDelivery, _paymentOnDeliveryService],
      [PaymentTypeEnum.GarantiPay, _garantiPayPaymentService],
      [PaymentTypeEnum.Wallet, _walletPaymentService],
      [PaymentTypeEnum.Loan, _walletPaymentService],
    ]);
  }

  ngOnInit(): void {
    this.subscribeToPaymentFailure();
    this.subscribeToRouter();
    this.subscribeToCheckout();
    this.subscribeToSidePayment();
    this._buildAgreementForm();
    this._subscribeToUser();
    this._subscribeToCardInfoService();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._sidePaymentService.cancelSidePayment();
  }

  getCheckoutInfo(): CheckoutInfoDTO {
    return this._checkoutInfo;
  }

  getBagQuantity(): number {
    return this.getCheckoutInfo().bagInfo[this._selectedBagType]?.quantity ?? 0;
  }

  getTotalBagPrice(): number {
    return this.getCheckoutInfo().bagInfo[this._selectedBagType]?.amount ?? 0;
  }

  getCallCenterIframeSrc(): SafeResourceUrl {
    return this._callCenterIframeSrc;
  }

  isCardProvisionShown(): boolean {
    return this.ONLINE_PAYMENTS.includes(this._selectedPaymentMethod);
  }

  isDistantSalesModalInvalid(): boolean {
    return (
      this.agreementFormGroup.get('distantSalesModal').invalid &&
      this.agreementFormGroup.get('distantSalesModal').touched
    );
  }

  isDistantSalesInvalid(): boolean {
    return this.agreementFormGroup.get('distantSales').invalid && this.agreementFormGroup.get('distantSales').touched;
  }

  isLoading(): boolean {
    return this._isLoading;
  }

  isBagChoiceContainerShown(): boolean {
    return !(
      this._checkoutInfo?.line?.serviceAreaObjectType === 'FOUNDATION' ||
      this._checkoutInfo?.line?.deliveryModel === 'SHIPMENT' ||
      this._appStateService.getPortfolio() === PortfolioEnum.KURBAN
    );
  }

  shouldDisplayInstallmentForm(): boolean {
    return this._installmentInfo?.available && this.INSTALLMENT_ENABLED_PAYMENTS.includes(this._selectedPaymentMethod);
  }

  onInstallmentChanged($event: number): void {
    this._installment = $event;
  }

  onPaymentMethodChanged($event: CheckoutPaymentFormBean.PaymentTypeEnum): void {
    this._selectedPaymentMethod = $event;
    if (this._sidePayment?.type === 'INSTANT_DISCOUNT' || this._sidePayment?.type === 'CARD_REWARD') {
      this._sidePaymentService.cancelSidePayment();
    }
  }

  openBagSelectorModal(): void {
    this._bagSelectorModalRef = this._matDialog.open(BagSelectorModalComponent, {
      closeOnNavigation: true,
      disableClose: false,
      panelClass: ['mobile-modal'],
      data: {
        initialBagType: this._selectedBagType,
        checkoutBagInfo: this._checkoutInfo.bagInfo,
      },
    });
    this._bagSelectorModalRef.componentInstance.closeEvent.subscribe(() => {
      this._bagSelectorModalRef.close();
    });
    this._bagSelectorModalRef.componentInstance.bagTypeSelected.subscribe((selectedBagType) => {
      this._selectedBagType = selectedBagType;
      this._updateCheckoutBagSelection(selectedBagType);
    });
  }

  onAgreementClick(agreementType: AgreementsType): void {
    this._agreementDialog.open(AgreementDialogComponent, {
      data: { type: agreementType, checkoutId: this._checkoutInfo.line.id, paymentType: this._selectedPaymentMethod },
      autoFocus: false,
    });
  }

  onSubmit(): void {
    if (!this._selectedPaymentMethod) {
      this._loggingService.logError({ title: 'Ödeme İşlemleri', message: 'Lütfen Ödeme Yöntemi Seçin' });
      return;
    }
    this.agreementFormGroup.markAllAsTouched();
    if (!this.agreementFormGroup.valid) {
      const firstElementWithError = document.querySelector('.agreement-form .ng-invalid');

      if (firstElementWithError) {
        firstElementWithError.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    let balance: PaymentBalance & { paymentType: PaymentTypeEnum } = {
      //@ts-expect-error enum mismatch between different beans
      balanceType: this._sidePayment?.type,
      balanceName: this._sidePayment?.name,
      balanceValue: this._calculateBalanceValue(),
      paymentType: this._selectedPaymentMethod,
      installment: this._installment > 1 ? this._installment : null,
      discount: this._sidePayment?.discount,
      bagSelected: this._selectedBagType ? this._selectedBagType === BagType.PLASTIC_BAG : null,
    };

    if (this._selectedPaymentMethod === 'CREDIT_CARD') {
      const { onlineCreditCardComponent } = this.mainPaymentComponent;
      onlineCreditCardComponent.markAllAsTouched();
      if (!onlineCreditCardComponent.isFormValid()) {
        return;
      }

      balance = {
        ...balance,
        ...onlineCreditCardComponent.onlinePaymentForm.value,
      };
    }

    if (!this._paymentServiceMap.has(this._selectedPaymentMethod)) {
      throw new Error(`Unknown payment type: ${this._selectedPaymentMethod}`);
    }

    const paymentService = this._paymentServiceMap.get(this._selectedPaymentMethod);
    paymentService.purchase(this.checkoutId, balance);
  }

  //TODO Remove this, backend should accept the input as it is
  private _calculateBalanceValue(): string {
    return PaymentTypeEnum.InstantDiscount !== this._sidePayment?.type && Number.isSafeInteger(this._sidePayment?.value)
      ? // Kurus to lira
        ((this._sidePayment.value as number) / 100).toString()
      : this._sidePayment?.value.toString();
  }

  private subscribeToPaymentFailure(): void {
    this._activatedRoute.queryParamMap.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((queryParamMap) => {
      if (queryParamMap.has('errorCode')) {
        const errorCode = queryParamMap.get('errorCode');
        const errorTitle = queryParamMap.get('errorTitle');
        const errorDetail = queryParamMap.get('errorDetail');
        this._loggingService.logError({
          title: `${errorCode} - ${errorTitle}`,
          message: errorDetail,
        });
      }
    });
  }

  private subscribeToRouter(): void {
    this._activatedRoute.params.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((params) => {
      this.checkoutId = +params['id'];
      this._sendGtmPageViewEvent('PaymentMethod', this.checkoutId);
      if (this._appStateService.isUserVisitingAppFirstTime() || this._appStateService.isUserNavigatedViaBackButton()) {
        this._checkoutService.getCheckoutInfo(this.checkoutId, CheckoutSteps.PAYMENT);
      }
    });
  }

  private subscribeToCheckout(): void {
    this._checkoutService.checkout$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((checkoutInfo) => !!Object.keys(checkoutInfo).length),
        distinctUntilKeyChanged('line', (prev, curr) => prev.id === curr.id)
      )
      .subscribe((checkout) => {
        this._checkoutInfo = checkout;
        this._sendGtmEvent(checkout);
        //
        if (checkout.line?.bagSelected === null || checkout.line?.bagSelected === undefined) {
          this._selectedBagType = BagType.PLASTIC_BAG;
        } else {
          this._selectedBagType = checkout.line.bagSelected ? BagType.PLASTIC_BAG : BagType.CLOTH_BAG;
        }
        this._updateCheckoutBagSelection(this._selectedBagType);
        //
        this._isLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }

  private subscribeToSidePayment(): void {
    this._sidePaymentService
      .getUsedSidePayment$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((sidePayment) => {
        this._sidePayment = sidePayment;
      });
  }

  private _buildAgreementForm(): void {
    this.agreementFormGroup = this._formBuilder.group({
      distantSalesModal: [null, [Validators.requiredTrue]],
      distantSales: [null, [Validators.requiredTrue]],
    });
  }

  private _sendGtmEvent(checkoutInfo): void {
    if (checkoutInfo && checkoutInfo.itemInfos) {
      const products = checkoutInfo.itemInfos.map((checkoutItem, index) => {
        return this._gtmService.generateGtmProductData(
          checkoutItem.product,
          index,
          'checkout/paymentMethod',
          checkoutItem.item.amount,
          checkoutItem.totalDiscount
        );
      });

      const data = {
        event: 'ecommerceCheckout',
        nonInteraction: true,
        eventType: 'Checkout',
        ecommerce: {
          checkout: {
            actionField: { step: 3 },
            products,
          },
        },
      };

      this._gtmService.sendCheckoutEvent(data);
    }
  }

  private _sendGtmPageViewEvent(page, id): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Ödeme Yöntemi | Sanalmarket',
      virtualPageName: page,
      objectId: id,
    });
  }

  private _subscribeToUser(): void {
    this._userService.user$
      .pipe(
        map((user) => user.id),
        distinctUntilChanged()
      )
      .subscribe((userId) => {
        this._callCenterIframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(
          `https://channelconnector.smartmessage-connect.com/Webchat/Window/8C6A2A440154807917EC00EC5D78DA66BACD1AFAB54AABF060820e77a2f247b5babb69725f7725e70b67d1f3?customerRef=${userId}`
        );
      });
  }

  private _updateCheckoutBagSelection(selectedBagType: BagType): void {
    this._checkoutService.updateCheckout({
      ...this._checkoutInfo,
      line: { ...this._checkoutInfo.line, bagSelected: selectedBagType === BagType.PLASTIC_BAG },
    });
  }

  private _subscribeToCardInfoService(): void {
    this._cardInfoService.installmentInfo$
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((installmentInfo: InstallmentInfoDTO) => {
        this._installmentInfo = installmentInfo;
      });
  }
}
