import { Directive, ElementRef, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material-experimental/mdc-input';

import { LazyScriptLoaderService } from '@fe-commerce/core';

@Directive({
  selector: 'input[feMdcMaskedInput]',
  providers: [
    { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: MdcMaskedInputDirective },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MdcMaskedInputDirective),
      multi: true,
    },
  ],
})
export class MdcMaskedInputDirective implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() value: string | null;
  @Input() maskOptions: any;

  protected _maskedInput: any;
  private _maskLoaded = false;
  private _currentValue: string;

  constructor(
    protected _elementRef: ElementRef<HTMLInputElement>,
    protected _lazyScriptLoaderService: LazyScriptLoaderService
  ) {}

  ngOnInit() {
    this._maskLoaded = false;
    this._lazyScriptLoaderService
      .load({
        src: 'https://cdnjs.cloudflare.com/ajax/libs/imask/6.0.7/imask.min.js',
        name: 'imask',
      })
      .subscribe(() => {
        this._maskLoaded = true;
        // @ts-expect-error https://imask.js.org/guide.html
        this._maskedInput = IMask(this._elementRef.nativeElement, this.maskOptions);
        this._maskedInput.on('accept', () => {
          this._onChange(this._maskedInput.unmaskedValue);
        });
        if (this._currentValue) {
          this.writeValue(this._currentValue);
        }
      });
  }

  ngOnDestroy() {
    if (this._maskedInput) {
      this._maskedInput.destroy();
    }
  }

  _onChange(value: any): void {
    //
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    //
  }

  writeValue(value: any): void {
    if (value) {
      if (this._maskLoaded) {
        this._maskedInput.value = value;
      } else {
        this._currentValue = value;
      }
    }
  }
}
