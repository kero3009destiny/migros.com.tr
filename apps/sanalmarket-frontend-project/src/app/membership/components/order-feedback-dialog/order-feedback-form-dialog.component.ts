import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { FeedbackFormModel, ToasterService } from '@fe-commerce/shared';

import { catchError, finalize, map } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-light-svg-icons/faTimes';
import {
  AppResponseFeedbackResult,
  FeedbackFormBean,
  FeedbackReasonInfo,
  FeedbackRestControllerService,
  UserDTO,
} from '@migroscomtr/sanalmarket-angular';
import { throwError } from 'rxjs';

export interface OrderFeedbackFormDialogData {
  user: UserDTO;
}

@Component({
  selector: 'sm-membership-order-feedback-dialog',
  templateUrl: './order-feedback-form-dialog.component.html',
  styleUrls: ['./order-feedback-form-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFeedbackFormDialogComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  private _initialFeedbackFormValues: FeedbackFormModel;
  private _reasons: FeedbackReasonInfo[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OrderFeedbackFormDialogData,
    private _feedbackRestService: FeedbackRestControllerService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _toasterService: ToasterService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setInitialFeedbackFormValues();
    this.fetchFeedbackReasons();
  }

  getInitialFormValues(): FeedbackFormModel {
    return this._initialFeedbackFormValues;
  }

  getReasons(): FeedbackReasonInfo[] {
    return this._reasons;
  }

  getTimesIcon(): IconProp {
    return faTimes;
  }

  fetchFeedbackReasons(): void {
    this._feedbackRestService
      .getReasons()
      .pipe(
        catchError((error) => {
          throw new Error(error);
        }),
        map((response) => response.data)
      )
      .subscribe((data) => {
        this._reasons = data;
        this._cdr.detectChanges();
      });
  }

  onSendFeedback(feedbackData: FeedbackFormBean): void {
    this._loadingIndicatorService.start();
    this._feedbackRestService
      .addFeedback(feedbackData)
      .pipe(
        catchError((error) => {
          return throwError(error);
        }),
        finalize(() => this._loadingIndicatorService.stop()),
        map((response: AppResponseFeedbackResult) => response.data)
      )
      .subscribe(() => {
        this._toasterService.showToaster({
          settings: {
            state: 'success',
          },
          data: {
            title: 'Mesajınız bize ulaştı!',
            message: 'Katkılarınızdan dolayı teşekkür ederiz.',
          },
        });
        this.closed.emit();
        this._cdr.detectChanges();
      });
  }

  private setInitialFeedbackFormValues(): void {
    this._initialFeedbackFormValues = {
      email: this.data.user.email,
      firstName: this.data.user.firstName,
      lastName: this.data.user.lastName,
      messageText: '',
      phoneNumber: this.data.user.phoneNumber,
      reason: null,
    };
    this._cdr.detectChanges();
  }
}
