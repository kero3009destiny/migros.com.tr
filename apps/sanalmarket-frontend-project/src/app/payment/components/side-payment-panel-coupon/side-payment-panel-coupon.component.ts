import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Validators } from '@angular/forms';

import { AbstractSidePaymentPanelDirective } from '@fe-commerce/line-payment-side';
import { CouponInfoModel } from '@fe-commerce/shared';

import { faTicketAlt } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-side-payment-panel-coupon',
  templateUrl: './side-payment-panel-coupon.component.html',
  styleUrls: ['./side-payment-panel-coupon.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidePaymentPanelCouponComponent extends AbstractSidePaymentPanelDirective implements OnChanges {
  readonly COUPON_ICON = faTicketAlt;
  readonly EXTRA_VALIDATORS = [Validators.minLength(4)];

  private _usableCoupons: CouponInfoModel[] = [];

  @Input() coupons: CouponInfoModel[];

  constructor() {
    super('COUPON', 'COUPON');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.coupons) {
      if (changes.coupons.previousValue !== changes.coupons.currentValue) {
        this._usableCoupons = this._filterUsedCoupon(changes.coupons.currentValue ?? []);
      }
    }
  }

  getUsableCoupons() {
    return this._usableCoupons;
  }

  hasAvailableCoupons(): boolean {
    return this.getUsableCoupons().length > 0;
  }

  onFormSubmitted($event: string | number): void {
    this.onClickUsed($event);
  }

  private _filterUsedCoupon(value: CouponInfoModel[]): CouponInfoModel[] {
    return this.isUsed() ? value.filter((coupon) => coupon.identifier !== this.usedSidePayment.value) : value;
  }
}
