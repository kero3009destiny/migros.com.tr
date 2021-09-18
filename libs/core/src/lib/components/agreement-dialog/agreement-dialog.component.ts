import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material-experimental/mdc-dialog';

import { AgreementsType, HttpResponseModel } from '@fe-commerce/shared';

import { Observable, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import {
  AcceptAgreementRequest,
  AgreementRestControllerService,
  AppResponsestring,
  BkmTokenFormBean,
} from '@migroscomtr/sanalmarket-angular';

import { CompositeDialogRefService } from '../../services/dialog/composite-dialog-ref.service';
import { LoadingIndicatorService } from '../../services/loading-indicator/loading-indicator.service';
import AcceptedAgreementsEnum = AcceptAgreementRequest.AcceptedAgreementsEnum;
import PaymentTypeEnum = BkmTokenFormBean.PaymentTypeEnum;

interface AgreementDialogData {
  type: AcceptedAgreementsEnum;
  checkoutId?: number;
  paymentType?: PaymentTypeEnum;
  header: string;
  closeButtonText: string;
  orderId?: number;
  html?: string;
  inDialogApproval?: {
    text: string;
  };
}

@Component({
  selector: 'fe-agreement-dialog',
  templateUrl: './agreement-dialog.component.html',
  styleUrls: ['./agreement-dialog.component.scss'],
  providers: [CompositeDialogRefService],
})
export class AgreementDialogComponent implements OnInit, OnDestroy {
  private _agreementSubscription: Subscription;
  agreementHTML: string;
  dialogRef: MatDialogRef<AgreementDialogComponent>;
  data: AgreementDialogData;
  private _agreementServiceMethodTypes: Record<AgreementsType, () => Observable<AppResponsestring>> = {
    DISTANT_SALES_AGREEMENT_MODAL: () =>
      this._agreementService.getDistantSalesModal(this.data.checkoutId, this.data.paymentType),
    DISTANT_SALES_AGREEMENT: () =>
      this._agreementService.getDistantSalesAgreement(this.data.checkoutId, this.data.paymentType),
    MEMBERSHIP_AGREEMENT: () => this._agreementService.getMembershipV2Agreement(),
    EXPLICIT_CONSENT: () => this._agreementService.getExplicitConsentAgreement(),
    KVK_MEMBERSHIP_AGREEMENT: () => this._agreementService.getKvkMembershipAgreement(),
    PERSONAL_DATA_AGREEMENT: () => this._agreementService.getKvkAgreement(),
    PRIVACY_AGREEMENT: () => this._agreementService.getPrivacyAgreement(),
    ENLIGHTENMENT_AGREEMENT: () => this._agreementService.getEnlightenment(),
    ORDER_AGREEMENT: () => this._agreementService.getOrderDistantSalesAgreement(this.data.orderId),
    MCC_MEMBERSHIP_AGREEMENT: () => this._agreementService.getMccMembershipAgreement(),
    MCC_KVK_MEMBERSHIP_AGREEMENT: () => this._agreementService.getMoneyKvkMembershipInfoAgreement(),
    MCC_CONTACT_MEMBERSHIP_AGREEMENT: () => this._agreementService.getMoneyKvkMembershipAgreement(),
  };

  constructor(
    private _agreementService: AgreementRestControllerService,
    private _dialogSupplier: CompositeDialogRefService<AgreementDialogComponent, AgreementDialogData>,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.data = this._dialogSupplier.data;
    this.dialogRef = this._dialogSupplier.dialogRef;
  }

  ngOnInit() {
    if (this.data.type) {
      this.getAgreement(this.data.type);
      return;
    }
    if (this.data.html) {
      this.insertAgreement(this.data.html);
      return;
    }
  }

  ngOnDestroy() {
    if (this._agreementSubscription) {
      this._agreementSubscription.unsubscribe();
    }
  }

  insertAgreement(agreementHTML: string) {
    this.agreementHTML = agreementHTML;
  }

  getAgreement(agreementType: AcceptedAgreementsEnum) {
    const agreementServiceMethod = this._agreementServiceMethodTypes[agreementType];

    this._loadingIndicatorService.start();
    this._agreementSubscription = agreementServiceMethod()
      .pipe(
        catchError((error) => this.handleError(error)),
        map((response: HttpResponseModel) => response.data),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((data) => {
        this.agreementHTML = data;
        this._changeDetectorRef.detectChanges();
      });
  }

  handleError(error: any) {
    this.dialogRef.close();
    return throwError(error);
  }

  onDismissClick() {
    this.data.inDialogApproval ? this.dialogRef.close(true) : this.dialogRef.close();
  }

  isAgreementReady(): boolean {
    return !!this.agreementHTML;
  }

  getDialogActionButtonText(): string {
    return (this.data.inDialogApproval ? this.data.inDialogApproval.text : this.data.closeButtonText) || 'Kapat';
  }
}
