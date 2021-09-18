import { Directive, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface CompleteMembershipEvent {
  permitContact: boolean | null;
}

@Directive()
export abstract class CompleteMembershipRef implements OnInit {
  completeMembershipFormGroup: FormGroup;

  protected constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this._buildCompleteMembershipForm();
  }

  private _buildCompleteMembershipForm(): void {
    this.completeMembershipFormGroup = this._formBuilder.group({
      registrationAgreements: [],
    });
  }

  isCompleteMembershipDisabled(): boolean {
    return this.completeMembershipFormGroup.invalid;
  }

  onClickCompleteMembershipButton(): void {
    this.touchAllFields();
  }

  touchAllFields(): void {
    this.completeMembershipFormGroup.markAllAsTouched();
  }

  createCompleteMembershipEvent(): CompleteMembershipEvent {
    return {
      permitContact: this.completeMembershipFormGroup.value.registrationAgreements?.permitContact,
    };
  }
}
