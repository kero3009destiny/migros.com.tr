import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { LoadingIndicatorService, LoggingService, UserService } from '@fe-commerce/core';
import { SubscriptionAbstract, ToasterService } from '@fe-commerce/shared';

import { EMPTY } from 'rxjs';
import { catchError, filter, finalize, map, takeUntil, tap } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { FeedbackReasonInfo, FeedbackRestControllerService, UserDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-product-feedback-dialog',
  templateUrl: './product-feedback-dialog.component.html',
  styleUrls: ['./product-feedback-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFeedbackDialogComponent extends SubscriptionAbstract implements OnInit {
  private _reasons: FeedbackReasonInfo[];
  productFeedbackForm: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public productId: number,
    private _feedbackReasonRestController: FeedbackRestControllerService,
    private _formBuilder: FormBuilder,
    private _cdr: ChangeDetectorRef,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _loggingService: LoggingService,
    private _userService: UserService,
    private _dialogRef: MatDialogRef<ProductFeedbackDialogComponent>,
    private _toasterService: ToasterService
  ) {
    super();
  }

  ngOnInit(): void {
    this._loadingIndicatorService.start();
    this.subscribeToUserService();
    this.subscribeToFeedbackService();
  }

  getFaTimesIcon(): IconProp {
    return faTimes;
  }

  getReasons(): FeedbackReasonInfo[] {
    return this._reasons;
  }

  isReasonsEmpty(): boolean {
    return !this._reasons;
  }

  onSubmitFeedback(): void {
    this._feedbackReasonRestController
      .addProductFeedback(this.productId, this.productFeedbackForm.value)
      .pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        map((response) => response.data),
        filter((data) => !!data),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe(() => {
        this._toasterService.showToaster({
          settings: {
            state: 'success',
          },
          data: {
            title: 'Önerin bize ulaştı',
            message: 'Önerin için teşekkür ederiz.',
          },
        });
        this._dialogRef.close();
      });
  }

  private subscribeToFeedbackService(): void {
    this._feedbackReasonRestController
      .getReasons('PRODUCT_DETAIL')
      .pipe(
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        map((response) => response.data),
        filter((data) => !!data),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((reasons) => {
        this._reasons = reasons;
        this._cdr.markForCheck();
      });
  }

  private buildFeedbackForm(user: UserDTO): void {
    this.productFeedbackForm = this._formBuilder.group({
      email: [user ? user.email : ''],
      reason: ['', [Validators.required]],
      messageText: ['', [Validators.required]],
    });
    this._cdr.markForCheck();
  }

  private subscribeToUserService(): void {
    this._userService.user$.subscribe((user) => {
      this.buildFeedbackForm(user);
    });
  }
}
