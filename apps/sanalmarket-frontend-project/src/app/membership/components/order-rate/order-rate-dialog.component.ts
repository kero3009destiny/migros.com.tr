import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';
import { MatRadioChange } from '@angular/material/radio';

import { OrderRatingService, RatingDialogComponent } from '@fe-commerce/membership';
import { ToasterService } from '@fe-commerce/shared';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons';
import { FeedbackReasonInfo, SimpleOrderFeedbackDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-order-rate',
  templateUrl: './order-rate-dialog.component.html',
  styleUrls: ['./order-rate-dialog.component.scss'],
  providers: [OrderRatingService],
  encapsulation: ViewEncapsulation.None,
})
export class OrderRateDialog extends RatingDialogComponent implements OnInit {
  private _dialogState: 'DELIVERER' | 'ORDER';
  private _selectedReason: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) dialogData: SimpleOrderFeedbackDTO,
    _orderRatingService: OrderRatingService,
    _formBuilder: FormBuilder,
    _toasterService: ToasterService,
    ratingSuccessDialog: MatDialog,
    dialogRef: MatDialogRef<RatingDialogComponent>
  ) {
    super(_formBuilder, _orderRatingService, _toasterService, ratingSuccessDialog, dialogRef, dialogData);
  }

  ngOnInit() {
    super.ngOnInit();
    this._dialogState = this.showDelivererRating() ? 'DELIVERER' : 'ORDER';
  }

  getFaTimesIcon(): IconProp {
    return faTimes;
  }

  getChevronRightIcon(): IconProp {
    return faChevronRight;
  }

  isButtonDisable(): boolean {
    const { delivererReason } = this.ratingFormGroup.value;
    return !this.delivererRatingValue || (this.delivererRatingValue < 3 && !delivererReason);
  }

  isSubmitButtonDisable(): boolean {
    const { orderReason } = this.ratingFormGroup.value;
    return !this.orderRatingValue || (this.orderRatingValue < 3 && !orderReason);
  }

  isDelivererState(): boolean {
    return this._dialogState === 'DELIVERER';
  }

  isDeliveryReasonSelected(reason: FeedbackReasonInfo): boolean {
    return this._selectedReason === reason.name;
  }

  isOrderReasonSelected(reason: FeedbackReasonInfo): boolean {
    return this._selectedReason === reason.name;
  }

  onChangeReason(matRadioChange: MatRadioChange): void {
    this._selectedReason = matRadioChange.value;
  }

  changeState(state: 'DELIVERER' | 'ORDER'): void {
    this._dialogState = state;
  }
}
