import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material-experimental/mdc-checkbox';

import { CheckoutService } from '@fe-commerce/line-checkout';
import { CardInfoService } from '@fe-commerce/line-payment-credit-card';
import { SidePaymentFacade } from '@fe-commerce/line-payment-side';

import { filter, map } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faQuestionCircle } from '@fortawesome/pro-solid-svg-icons/faQuestionCircle';
import { CheckoutInfoDTO, CheckoutPaymentCreditCardFormBean, RewardInfo } from '@migroscomtr/sanalmarket-angular';
import PaymentTypeEnum = CheckoutPaymentCreditCardFormBean.PaymentTypeEnum;
import { MasterpassService, MasterpassStateService, UserStatus } from '@fe-commerce/line-payment-masterpass';

@Component({
  selector: 'sm-online-credit-card',
  templateUrl: './online-credit-card.component.html',
  styleUrls: ['./online-credit-card.component.scss'],
})
export class OnlineCreditCardComponent implements OnInit, OnDestroy {
  isUserUpdateNeeded$ = this._masterpassService.getStatus().pipe(map((status) => status === UserStatus.UPDATE_NEEDED));

  private _checkoutInfo: CheckoutInfoDTO;
  private _rewardInfos: RewardInfo[] = [];
  private _months: Array<string>;
  private _years: Array<number> = [];
  private _questionIcon: IconProp = faQuestionCircle;

  private readonly _maskOptions = {
    mask: '0000 0000 0000 0000',
  };

  isCreditCardBonusSelected = false;
  onlinePaymentFormGroup: FormGroup;

  @ViewChild('onlinePaymentForm') onlinePaymentForm: FormGroupDirective;
  @ViewChild('formElement') formElement: ElementRef<HTMLFormElement>;
  @Input() closedPayments: PaymentTypeEnum[];
  @Output() selectedPaymentMethod = new EventEmitter<PaymentTypeEnum>();

  constructor(
    private _formBuilder: FormBuilder,
    private _cardInfoService: CardInfoService,
    private _checkoutService: CheckoutService,
    private _sidePaymentService: SidePaymentFacade,
    protected _masterpassService: MasterpassService,
    protected _masterpassStateService: MasterpassStateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscribeToCheckout();
    this.getDates();
    this.buildOnlinePaymentForm();
    this.subscribeToCardInfoService();
    this._sidePaymentService.getUsedSidePayment$().subscribe((sidePayment) => {
      const previousValue = this.isCreditCardBonusSelected;
      this.isCreditCardBonusSelected = sidePayment?.type === 'CARD_REWARD';
      if (previousValue !== this.isCreditCardBonusSelected) {
        this.cd.markForCheck();
      }
    });
  }

  isMasterpassDisabled(): boolean {
    return this.closedPayments.includes(PaymentTypeEnum.Masterpass);
  }

  markAllAsTouched(): void {
    this.onlinePaymentFormGroup.markAllAsTouched();
    this.focusOnInvalidInputs();
    this.cd.markForCheck();
  }

  focusOnInvalidInputs(): void {
    const invalidField = this.formElement.nativeElement.querySelector('.ng-invalid') as HTMLElement;
    if (invalidField) {
      const invalidInput = invalidField.querySelector('input.ng-invalid') as HTMLInputElement;
      if(invalidInput){
        invalidInput.focus({ preventScroll: true });
      }
      invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  isFormValid(): boolean {
    return this.onlinePaymentFormGroup.valid;
  }

  private buildOnlinePaymentForm(): void {
    this.onlinePaymentFormGroup = this._formBuilder.group({
      cardHolderName: [null, [Validators.required]],
      cardNumber: [null, [Validators.required, Validators.maxLength(16), Validators.minLength(15)]],
      expireMonth: [null, [Validators.required]],
      expireYear: [null, [Validators.required]],
      cvv2: [null, [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      secure: false,
    });
  }

  private subscribeToCardInfoService(): void {
    this._cardInfoService.rewardInfo$
      .pipe(
        filter((rewardInfoDto) => !!rewardInfoDto),
        map((rewardInfoDto) => rewardInfoDto.rewardInfos)
      )
      .subscribe((rewardInfos: RewardInfo[]) => {
        this._rewardInfos = rewardInfos;
        this.cd.markForCheck();
      });
  }

  private getDates(): void {
    const date = new Date();
    const currentYear = date.getFullYear();
    const years = Array(20).fill(currentYear);

    this._months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    this._years = years.map((year, index) => year + index);

    this.cd.markForCheck();
  }

  private subscribeToCheckout(): void {
    this._checkoutService.checkout$
      .pipe(filter((checkoutInfo) => !!Object.keys(checkoutInfo).length))
      .subscribe((checkout) => {
        this._checkoutInfo = checkout;
        this.cd.markForCheck();
      });
  }

  isCardRewardsEmpty(): boolean {
    return this._rewardInfos?.length === 0 && !!this._rewardInfos?.filter((reward) => this.isRewardUsable(reward));
  }

  isRewardUsable(reward: RewardInfo): boolean {
    return reward?.reward >= reward?.minUsable;
  }

  getCheckoutId(): number {
    return this._checkoutInfo.line.id;
  }

  getTipIcon(): IconProp {
    return this._questionIcon;
  }

  getMonths(): string[] {
    return this._months;
  }

  getYears(): number[] {
    return this._years;
  }

  getRewards(): RewardInfo[] {
    return this._rewardInfos;
  }

  getCardHolderName(): AbstractControl {
    return this.onlinePaymentFormGroup.get('cardHolderName');
  }

  getCardNumber(): AbstractControl {
    return this.onlinePaymentFormGroup.get('cardNumber');
  }

  getExpireMonth(): AbstractControl {
    return this.onlinePaymentFormGroup.get('expireMonth');
  }

  getExpireYear(): AbstractControl {
    return this.onlinePaymentFormGroup.get('expireYear');
  }

  getCvv2(): AbstractControl {
    return this.onlinePaymentFormGroup.get('cvv2');
  }

  getRewardName(reward: RewardInfo): string {
    return reward?.name.toLocaleLowerCase();
  }

  getMaskOptions() {
    return this._maskOptions;
  }

  onChangeBonusUsage(matCheckboxChange: MatCheckboxChange, reward: RewardInfo): void {
    if (this.isCreditCardBonusSelected) {
      this._sidePaymentService.useSidePayment(
        {
          type: 'CARD_REWARD',
          value: reward.reward,
          name: reward.name,
        },
        this._checkoutInfo.line.id
      );
    } else {
      this._sidePaymentService.cancelSidePayment();
    }
  }

  onSelectedPaymentChanged($event: CheckoutPaymentCreditCardFormBean.PaymentTypeEnum): void {
    this.selectedPaymentMethod.emit($event);
  }

  ngOnDestroy() {
    this._cardInfoService.cleanUpRewardInfo();
  }

  onLinkAccepted() {
    this._masterpassStateService.setStatus(UserStatus.UPDATE_APPROVED);
  }
}
