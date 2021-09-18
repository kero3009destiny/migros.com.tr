import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

import { OtpDialogComponentRefDirective, STEPS } from '@fe-commerce/core';

import { MasterPassClientInterface } from '../../models';
import { extractInputsFromNodeList } from '../../utils';

declare const MFS: MasterPassClientInterface;

@Component({
  selector: 'fe-masterpass-otp-modal',
  templateUrl: './masterpass-otp-modal.component.html',
  styleUrls: ['./masterpass-otp-modal.component.scss'],
})
export class MasterpassOtpModalComponent extends OtpDialogComponentRefDirective implements AfterViewInit {
  currentStep = STEPS['verify'];

  @ViewChild('validationForm') validationForm: ElementRef<HTMLFormElement>;

  @Output() modalDismissed = new EventEmitter<never>();

  ngAfterViewInit(): void {
    this.timerBar = this.timerBars.first;
    this.tryAgainEnableInSeconds = 60;
    this.countDownTime = 120;
    this.startCountdown();
  }

  verifyPhoneNumber(code: string) {
    const validationInputs: HTMLInputElement[] = extractInputsFromNodeList(this.validationForm);
    validationInputs.find((el) => el.name === 'validationCode').value = code;
    this.userVerified.emit(validationInputs);
  }

  reSendSMSCode(): void {
    this.tryAgainEnableInSeconds = 60;
    this.countDownTime = 120;
    this.startCountdown();
    const token = MFS.getLastToken();
    MFS.resendOtp(token, 'tur', () => {
      // Legal empty function
    });
  }

  dismissDialog(): void {
    super.dismissDialog();
    this.modalDismissed.emit();
  }
}
