import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { ToasterService } from '@fe-commerce/shared';

import { Observable } from 'rxjs';

import { FeedbackReasonInfo, SimpleOrderFeedbackDTO } from '@migroscomtr/sanalmarket-angular';

import { OrderRatingService } from '../../services/order-rating.service';
import { RatingSuccessDialogComponent } from '../rating-success-dialog/rating-success-dialog.component';

@Component({
  selector: 'fe-membership-rating-dialog',
  templateUrl: './rating-dialog.component.html',
  styleUrls: ['./rating-dialog.component.scss'],
  providers: [OrderRatingService],
})
export class RatingDialogComponent implements OnInit {
  ratingFormGroup: FormGroup;
  delivererRatingValue: number;
  orderRatingValue: number;

  @Output() ratingFormSubmit = new EventEmitter<number>();

  constructor(
    protected _formBuilder: FormBuilder,
    protected _orderRatingService: OrderRatingService,
    private _toasterService: ToasterService,
    private ratingSuccessDialog: MatDialog,
    public dialogRef: MatDialogRef<RatingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected dialogData: SimpleOrderFeedbackDTO
  ) {}

  ngOnInit() {
    this.buildRatingForm();
    this._orderRatingService.fetchAllScoreReasons();
  }

  isButtonDisable(): boolean {
    if (this.showDelivererRating()) {
      return !this.orderRatingValue || !this.delivererRatingValue;
    }
    return !this.orderRatingValue;
  }

  isDelivererRateInvalid(): boolean {
    const { delivererReason } = this.ratingFormGroup.value;
    return this.showDelivererRating() && this.delivererRatingValue < 3 && !delivererReason;
  }

  isOrderRateInvalid(): boolean {
    const { orderReason } = this.ratingFormGroup.value;
    return this.orderRatingValue < 3 && !orderReason;
  }

  getOrderRatingValue(): number {
    return this.orderRatingValue;
  }

  getDelivererRatingValue(): number {
    return this.delivererRatingValue;
  }

  getDeliveryScoreReasons(): Observable<FeedbackReasonInfo[]> {
    return this._orderRatingService.getDeliveryScoreReasons();
  }

  getOrderScoreReasons(): Observable<FeedbackReasonInfo[]> {
    return this._orderRatingService.getOrderScoreReasons();
  }

  showDelivererRating(): boolean {
    return this.dialogData.showDelivererRate;
  }

  onRatingSubmit(): void {
    if (this.isDelivererRateInvalid() || this.isOrderRateInvalid()) {
      this._toasterService.showToaster({
        settings: { state: 'danger' },
        data: {
          title: 'İşlem Başarısız',
          message: 'Lütfen bir seçim yapınız.',
        },
      });
      return;
    }

    const { delivererReview, orderReview, delivererReason, orderReason } = this.ratingFormGroup.value;

    const deliveryFeedbackBody = {
      category: 'DELIVERY_SCORE',
      messageText: delivererReview,
      reason: delivererReason,
      score: this.delivererRatingValue,
    };

    const orderFeedbackBody = {
      category: 'ORDER_SCORE',
      messageText: orderReview,
      reason: orderReason,
      score: this.orderRatingValue,
    };

    this.ratingFormSubmit.emit();

    if (this.showDelivererRating()) {
      this._orderRatingService
        .addCompleteFeedback(this.dialogData.orderId, orderFeedbackBody, deliveryFeedbackBody)
        .subscribe(([orderFeedbackResult, deliveryFeedbackResult]) => {
          if (orderFeedbackResult.result === 'SUCCESS' && deliveryFeedbackResult.result === 'SUCCESS') {
            this.ratingFormSubmit.emit(this.dialogData.orderId);
            this.dialogRef.close();
            this.openSuccessDialog();
          } else {
            this._toasterService.showToaster({
              settings: { state: 'danger' },
              data: {
                title: 'İşlem Başarısız',
                message: orderFeedbackResult.errorMessage || deliveryFeedbackResult.errorMessage,
              },
            });
          }
        });
    } else {
      this._orderRatingService.addOrderFeedback(this.dialogData.orderId, orderFeedbackBody).subscribe((data) => {
        if (data.result === 'SUCCESS') {
          this.ratingFormSubmit.emit();
          this.dialogRef.close();
          this.openSuccessDialog();
        } else {
          this._toasterService.showToaster({
            settings: { state: 'danger' },
            data: { title: 'İşlem Başarısız', message: data.errorMessage },
          });
        }
      });
    }
  }

  onClickDelivererRating(index: number): void {
    this.delivererRatingValue = index + 1;
  }

  onClickOrderRating(index: number): void {
    this.orderRatingValue = index + 1;
  }

  dismissDialog(): void {
    this.dialogRef.close();
  }

  openSuccessDialog(): void {
    this.ratingSuccessDialog.open(RatingSuccessDialogComponent, {
      panelClass: 'wide-dialog',
    });
  }

  buildRatingForm(): void {
    this.ratingFormGroup = this._formBuilder.group({
      delivererReason: '',
      delivererReview: '',
      orderReason: '',
      orderReview: '',
    });
  }
}
