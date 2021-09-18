import { Directive, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material-experimental/mdc-input';

import { MdcMaskedInputDirective } from './mdc-masked-input.directive';

@Directive({
  selector: 'input[feMdcMaskedPrice]',
  providers: [
    { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: MdcMaskedPriceDirective },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MdcMaskedPriceDirective),
      multi: true,
    },
  ],
})
export class MdcMaskedPriceDirective extends MdcMaskedInputDirective implements OnInit, OnDestroy {
  ngOnInit() {
    this._lazyScriptLoaderService
      .load({
        src: 'https://cdnjs.cloudflare.com/ajax/libs/imask/6.0.7/imask.min.js',
        name: 'imask',
      })
      .subscribe(() => {
        // @ts-expect-error https://imask.js.org/guide.html
        this._maskedInput = IMask(this._elementRef.nativeElement, this.maskOptions);
        this._maskedInput.on('accept', () => {
          const parsedValue = Number.parseFloat(this._maskedInput.unmaskedValue);
          this._onChange(parsedValue ? parsedValue * 100 : this._maskedInput.unmaskedValue);
        });
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  writeValue(value: any) {
    const numValue = Number.parseInt(value, 10);
    if (Number.isInteger(numValue)) {
      this._maskedInput.value = (numValue / 100).toString();
    }
  }
}
