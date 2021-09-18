import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { LoadingIndicatorService, LoggingService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { EMPTY } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

import { faArrowLeft, faTimes } from '@fortawesome/pro-light-svg-icons';
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons';
import { KKYOffer, KKYOption, UserRestControllerService } from '@migroscomtr/sanalmarket-angular';

import { ROUTE_HOME } from '../../../routes';

@Component({
  selector: 'sm-create-campaign',
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateCampaignComponent extends SubscriptionAbstract implements OnInit {
  @Output() kkyEnrolled: EventEmitter<void> = new EventEmitter();

  // ICONS
  closeIcon = faTimes;
  arrowLeft = faArrowLeft;
  faCheckCircle = faCheckCircle;

  // STEPS
  // 1 - choose category
  // 2 - choose quota
  // 3 - ready to shop

  private currentStep = 1;

  // DATA
  private categories = [];

  // STATE
  private selectedCategory: KKYOffer;
  private selectedOption: KKYOption;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<CreateCampaignComponent>,
    private loggingService: LoggingService,
    private userRestController: UserRestControllerService,
    private loadingIndicatorService: LoadingIndicatorService,
    private cdr: ChangeDetectorRef,
    private _router: Router
  ) {
    super();
  }

  isCategorySelected(category: KKYOffer): boolean {
    return category === this.selectedCategory;
  }

  isContinueButtonDisabled(): boolean {
    if (this.currentStep === 3) {
      return false;
    }
    if (this.currentStep === 2) {
      return !this.selectedOption;
    }
    return !this.selectedCategory;
  }

  isBackButtonVisible(): boolean {
    return this.currentStep === 2;
  }

  isStepChooseCategory(): boolean {
    return this.currentStep === 1;
  }

  isStepChooseQuota(): boolean {
    return this.currentStep === 2;
  }

  isStepReadyToShop(): boolean {
    return this.currentStep === 3;
  }

  isOptionSelected(option: KKYOption): boolean {
    return this.selectedOption === option;
  }

  getCategories(): KKYOffer[] {
    return this.categories;
  }

  getSelectedCategory(): KKYOffer {
    return this.selectedCategory;
  }

  getSelectedOption(): KKYOption {
    return this.selectedOption;
  }

  getCTAButtonLabel(): string {
    if (this.currentStep === 1) {
      return 'Devam Et';
    } else if (this.currentStep === 2) {
      return 'Kampanyanı Oluştur';
    } else {
      return 'Alışverişe Başla';
    }
  }

  getTitleText(): string {
    if (this.currentStep === 1) {
      return 'Kampanya Kategorini Seç';
    } else if (this.currentStep === 2) {
      return 'Kampanya Tutarını Belirle';
    }
  }

  onClickClose(): void {
    this.dialogRef.close();
  }

  onClickGoBack(): void {
    if (this.currentStep < 1) {
      this.currentStep = 1;
    }
    this.currentStep = this.currentStep - 1;
  }

  onClickContinue(): void {
    if (this.currentStep > 3) {
      this.currentStep = 3;
    }
    if (this.currentStep === 2) {
      this.enrollKKYCampaign();
    }
    if (this.currentStep === 3) {
      this.onClickClose();
      this._router.navigate([ROUTE_HOME]);
    }
    this.currentStep = this.currentStep + 1;
  }

  enrollKKYCampaign(): void {
    const params = {
      externalCategoryId: this.getSelectedCategory().externalCategoryId,
      prize: this.getSelectedOption().prize,
      quota: this.getSelectedOption().quota,
    };

    this.loadingIndicatorService.start();

    this.userRestController
      .enrollKKYCampaign(params)
      .pipe(
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        finalize(() => {
          this.loadingIndicatorService.stop();
        })
      )
      .subscribe((response) => {
        this.kkyEnrolled.emit();
      });
  }

  onClickCategory(selectedCategory: KKYOffer): void {
    this.selectedCategory = selectedCategory;
  }

  onClickOption(selectedOption: KKYOption): void {
    this.selectedOption = selectedOption;
  }

  initialize(): void {
    this.loadingIndicatorService.start();
    this.userRestController
      .getKKYOffers()
      .pipe(
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        finalize(() => {
          this.loadingIndicatorService.stop();
          this.cdr.detectChanges();
        })
      )
      .subscribe((offers) => {
        this.categories = offers.data;
        this.cdr.detectChanges();
      });
  }

  ngOnInit() {
    this.initialize();
  }
}
