import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FeedbackReasonInfo } from '@migroscomtr/sanalmarket-angular';

import { ToasterService } from '../../features/toaster/services/toaster.service';
import { FeedbackFormModel } from '../../models';

@Component({
  selector: 'fe-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
})
export class FeedbackFormComponent implements OnInit {
  @Input() showHint = true;

  @Input() initialValues: FeedbackFormModel;
  @Input() reasons: FeedbackReasonInfo[];
  @Output() sendFeedback: EventEmitter<FeedbackFormModel> = new EventEmitter<FeedbackFormModel>();

  feedbackFormGroup: FormGroup;

  constructor(private _toasterService: ToasterService, private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.buildForm();
  }

  onFormSubmit(): void {
    this.sendFeedback.emit(this.getFormValue());
  }

  getFirstName(): AbstractControl {
    return this.feedbackFormGroup.get('firstName');
  }
  getLastName(): AbstractControl {
    return this.feedbackFormGroup.get('lastName');
  }
  getEmail(): AbstractControl {
    return this.feedbackFormGroup.get('email');
  }
  getReason(): AbstractControl {
    return this.feedbackFormGroup.get('reason');
  }
  getMessageText(): AbstractControl {
    return this.feedbackFormGroup.get('messageText');
  }
  getPhoneNumber(): AbstractControl {
    return this.feedbackFormGroup.get('phoneNumber');
  }
  getFormValue(): FeedbackFormModel {
    return this.feedbackFormGroup.value;
  }

  private buildForm(): void {
    const { firstName, lastName, email, reason, messageText, phoneNumber } = this.initialValues;

    this.feedbackFormGroup = this._formBuilder.group({
      firstName: [firstName, [Validators.required]],
      lastName: [lastName, [Validators.required]],
      email: [email, [Validators.required]],
      reason: [{ value: reason, disabled: false }, [Validators.required]],
      messageText: [messageText, [Validators.required, Validators.minLength(20)]],
      phoneNumber: [phoneNumber, [Validators.required, Validators.pattern(/^5{1}[0-9]{9}$/)]],
    });
  }
}
