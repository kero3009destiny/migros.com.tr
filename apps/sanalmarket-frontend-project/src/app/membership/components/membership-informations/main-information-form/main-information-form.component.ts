import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { PhoneVerifyService } from '@fe-commerce/auth';
import { LoadingIndicatorService, UserService } from '@fe-commerce/core';
import { OtpDialogDataModel, SubscriptionAbstract } from '@fe-commerce/shared';

import { finalize, takeUntil } from 'rxjs/operators';

import { faCheckCircle, faChevronRight, faInfoCircle } from '@fortawesome/pro-regular-svg-icons';
import { faBadgeCheck } from '@fortawesome/pro-solid-svg-icons';
import { UserDTO } from '@migroscomtr/sanalmarket-angular';

import { OtpUpdateEmailDialogComponent, OtpUpdatePhoneDialogComponent } from '../../../../core/dialogs';

@Component({
  selector: 'sm-main-information-form',
  templateUrl: './main-information-form.component.html',
  styleUrls: ['./main-information-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainInformationFormComponent extends SubscriptionAbstract {
  phoneNumberReadOnly = true;
  phoneNumberSaved = false;
  emailReadOnly = true;
  emailSaved = false;

  verifiedIcon = faBadgeCheck;
  savedIcon = faCheckCircle;
  infoIcon = faInfoCircle;
  chevronIcon = faChevronRight;

  maskOptions = { mask: '(000) 000 00 00' };

  @Input() formGroup: FormGroup;
  @Input() user: UserDTO;
  @Input() isNewRegister: boolean;
  @Output() verifyEmail = new EventEmitter();
  @Output() informationUpdated = new EventEmitter();
  @ViewChild('phoneNumber') _phoneNumber: ElementRef;
  @ViewChild('email') _email: ElementRef;

  constructor(
    private _userService: UserService,
    private _phoneVerifyService: PhoneVerifyService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _cdr: ChangeDetectorRef
  ) {
    super();
  }

  isPhoneNumberReadOnly(): boolean {
    return this.phoneNumberReadOnly;
  }

  isPhoneNumberSaved(): boolean {
    return this.phoneNumberSaved;
  }

  isEmailReadOnly(): boolean {
    return this.emailReadOnly;
  }

  isEmailSaved(): boolean {
    return this.emailSaved;
  }

  isEmailVerified(): boolean {
    return this.user.emailVerified;
  }

  getFormField(fieldName: string): AbstractControl {
    return this.formGroup.get(fieldName);
  }

  onBlurPhone(): void {
    if (this.getFormField('phoneNumber').valid) {
      this.phoneNumberReadOnly = true;
    }
  }

  onBlurEmail(): void {
    if (this.getFormField('email').valid) {
      this.emailReadOnly = true;
    }
  }

  onChangePhone(event: Event): void {
    event.stopPropagation();
    this.phoneNumberReadOnly = false;
    this._phoneNumber.nativeElement.focus();

    if (this.isEmailSaved()) {
      this.emailSaved = false;
    }
  }

  onChangeEmail(event: Event): void {
    event.stopPropagation();
    this.emailReadOnly = false;
    this._email.nativeElement.focus();

    if (this.isPhoneNumberSaved()) {
      this.phoneNumberSaved = false;
    }
  }

  onPhoneNumberUpdated(successful: boolean): void {
    this._loadingIndicatorService.stop();
    if (successful) {
      this.phoneNumberReadOnly = true;
      this.phoneNumberSaved = true;

      setTimeout(() => {
        this.phoneNumberSaved = false;
        this._cdr.markForCheck();
      }, 5000);
      this.informationUpdated.emit(successful);
    }
  }

  onUserEmailUpdated(successful: boolean): void {
    this._loadingIndicatorService.stop();
    if (successful) {
      this.emailReadOnly = true;
      this.emailSaved = true;

      setTimeout(() => {
        this.emailSaved = false;
        this._cdr.markForCheck();
      }, 5000);
      this.informationUpdated.emit(successful);
    }
  }

  onSavePhone(event: Event): void {
    event.stopPropagation();

    if (this.formGroup.get('phoneNumber').valid) {
      this._loadingIndicatorService.start();
      const phoneNumber = this.formGroup.get('phoneNumber').value;

      this._userService
        .sendOtpForPhoneNumberUpdate(phoneNumber)
        .pipe(
          takeUntil(this.getDestroyInterceptor()),
          finalize(() => this._loadingIndicatorService.stop())
        )
        .subscribe((data) => {
          const otpModalData: OtpDialogDataModel = {
            sendPhonePostData: {
              phoneNumber,
            },
            verifyPostData: {
              ...data,
            },
          };

          this._phoneVerifyService.openVerifyModal(
            OtpUpdatePhoneDialogComponent,
            otpModalData,
            this.onPhoneNumberUpdated.bind(this)
          );
        });
    }
  }

  onSaveEmail(event: Event): void {
    event.stopPropagation();

    if (this.formGroup.get('email').valid) {
      this._loadingIndicatorService.start();
      const email = this.formGroup.get('email').value;

      this._userService
        .updateUserEmail(email)
        .pipe(
          takeUntil(this.getDestroyInterceptor()),
          finalize(() => this._loadingIndicatorService.stop())
        )
        .subscribe((data) => {
          const otpModalData: OtpDialogDataModel = {
            sendPhonePostData: {
              email,
            },
            verifyPostData: {
              ...data,
            },
          };

          this._phoneVerifyService.openVerifyModal(
            OtpUpdateEmailDialogComponent,
            otpModalData,
            this.onUserEmailUpdated.bind(this)
          );
        });
    }
  }

  onClikVerifyEmail(): void {
    this.verifyEmail.emit();
  }
}
