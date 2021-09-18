import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'sm-side-payment-form',
  templateUrl: './side-payment-form.component.html',
  styleUrls: ['./side-payment-form.component.scss'],
})
export class SidePaymentFormComponent implements OnInit, OnChanges {
  formGroup: FormGroup;

  /**
   * All side payments accept lira as input, not kurus
   */
  private readonly _maskOptions = {
    mask: Number,
    scale: 0,
    max: 10000,
  };

  @Input() type: 'number' | 'string';
  @Input() amountUsed;
  @Input() defaultPlaceholder = 'Tutar Girin';
  @Input() suffix: string;
  @Input() extraValidators: ValidatorFn[];

  @Output() formSubmitted = new EventEmitter<string | number>();

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.extraValidators) {
      const { currentValue, previousValue } = changes.extraValidators;
      if (currentValue?.length !== previousValue?.length && this.formGroup) {
        this.formGroup.get('amount').setValidators(this.extraValidators);
      }
    }
  }

  isUsed(): boolean {
    return !!this.amountUsed;
  }

  getPlaceholder(): string {
    return this.amountUsed || this.defaultPlaceholder;
  }

  getFormControlName(): string {
    return 'amount';
  }

  getFormControl(): AbstractControl {
    return this.formGroup.get(this.getFormControlName());
  }

  getMaskOptions() {
    return this._maskOptions;
  }

  hasFormControlRequiredError(formControl: AbstractControl): boolean {
    return formControl.invalid && formControl.errors.required;
  }

  onSubmit(): void {
    const { amount } = this.formGroup.value;
    this.formSubmitted.emit(amount);
  }

  private buildForm(): void {
    this.formGroup = this._formBuilder.group({
      [this.getFormControlName()]: [
        { value: this.amountUsed, disabled: this.isUsed() },
        [Validators.required, ...this.extraValidators],
      ],
    });
  }
}
