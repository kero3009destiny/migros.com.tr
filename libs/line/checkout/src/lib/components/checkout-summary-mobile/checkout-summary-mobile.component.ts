import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { SidePaymentFacade } from '@fe-commerce/line-payment-side';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { Observable, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CheckoutInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { CheckoutService } from '../../services';

@Component({
  selector: 'fe-line-checkout-summary-mobile',
  templateUrl: './checkout-summary-mobile.component.html',
  styleUrls: ['./checkout-summary-mobile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CheckoutSummaryMobileComponent extends SubscriptionAbstract implements OnInit {
  @Input() isCartPage = false;
  @Input() checkoutInfo: CheckoutInfoDTO;
  @Input() isContinueButtonDisabled = false;
  @Output() continueClicked = new EventEmitter();

  constructor(
    private _checkoutService: CheckoutService,
    private _sidePaymentFacade: SidePaymentFacade,
    private _ref: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this._sidePaymentFacade
      .getUsedSidePayment$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(() => {
        // To capture possible revenue change
        this._ref.markForCheck();
      });
  }

  onMobileContinueClick(): void {
    this.continueClicked.emit();
  }

  getRevenue$(): Observable<number> {
    return this.isCartPage
      ? of(this.checkoutInfo.revenue)
      : this._checkoutService.getCalculatedCheckoutRevenueToBePaid();
  }
}
