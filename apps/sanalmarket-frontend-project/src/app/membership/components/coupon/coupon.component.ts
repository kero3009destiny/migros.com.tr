import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { UserService } from '@fe-commerce/core';
import { FormatPricePipe, ToasterService } from '@fe-commerce/shared';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCopy } from '@fortawesome/pro-light-svg-icons';
import { CouponResult } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouponComponent implements OnInit {
  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private toasterService: ToasterService,
    private formatPricePipe: FormatPricePipe
  ) {}

  private cheques: CouponResult[];
  private hasCheques = false;
  private copyIcon = faCopy;
  private _isLoading = true;

  isLoading(): boolean {
    return this._isLoading;
  }

  getCheques(): CouponResult[] {
    return this.cheques;
  }

  getPriceText(cheque: CouponResult): string {
    if (cheque.discountType === 'PERCENTAGE') {
      return '%' + cheque.discountValue;
    } else {
      return `₺${this.formatPricePipe.transform(cheque.discountValue)}`;
    }
  }

  getMessage(): string {
    return this._isLoading ? 'Kuponlar kontrol ediliyor...' : 'Kullanabileceğiniz aktif çekiniz bulunmuyor.';
  }

  getUserCheques(): CouponResult[] {
    return this.cheques;
  }

  getHasCheques(): boolean {
    return this.hasCheques;
  }

  getCopyIcon(): IconProp {
    return this.copyIcon;
  }

  ngOnInit(): void {
    this.userService.getUserCheques().subscribe((cheques) => {
      this._isLoading = false;
      this.cheques = cheques;
      this.hasCheques = this.cheques.length > 0;
      this.cdr.detectChanges();
    });
  }

  async copyToClipboard(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
    this.toasterService.showToaster({
      settings: {
        state: 'success',
      },
      data: {
        title: 'Kopyalandı!',
        message: 'Kupon kodunuz kopyalandı!',
      },
    });
  }
}
