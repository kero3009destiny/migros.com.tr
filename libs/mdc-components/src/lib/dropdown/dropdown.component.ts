import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormControlName, NgControl, NgForm } from '@angular/forms';
import { MatFormField, MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material-experimental/mdc-form-field';
import { MatSelect, MatSelectChange } from '@angular/material-experimental/mdc-select';
import { ErrorStateMatcher } from '@angular/material/core';

import { Subject } from 'rxjs';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface DropdownModel<R = string> {
  name: string;
  value: R;
}

class DropdownErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl, form: NgForm): boolean {
    return control.invalid && control.touched;
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'fe-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  encapsulation: ViewEncapsulation.None,
  /* Why encapsulation none ?
    Here is some different approaches for customizing mat-select:
    https://typescript.programmingpedia.net/en/knowledge-base/46766597/styling-mat-select-in-angular-material
   */
  providers: [{ provide: MatFormFieldControl, useExisting: DropdownComponent }],
})
export class DropdownComponent<T extends DropdownModel<R>, R = string>
  implements OnInit, ControlValueAccessor, MatFormFieldControl<T>, OnChanges, OnDestroy
{
  get empty() {
    return false;
  }

  @Input()
  get value(): T | null {
    return this.selectedOption;
  }
  set value(v: T | null) {
    if (v !== undefined && this.control) {
      this.writeValue(v);
      this.control.setValue(v);
      this.stateChanges.next();
    }
  }

  /**
   * @param _controlName : in order to manage error state
   */
  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() private _controlName: FormControlName,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  static nextId = 0;
  @ViewChild(MatSelect) mdcSelect: MatSelect;
  @Input() placeholder = '';
  @Input() options: T[];
  @Input() isSearchVisible = false;
  @Input() disabled = false;
  @Input() required = false;
  @Input() isFirstItemEmpty = false;
  @Input() icon: IconProp;
  @Input() scrollable = true;

  @Output() changed = new EventEmitter<T>();

  stateChanges = new Subject<void>();
  focused = false;
  id = `dropdown-${DropdownComponent.nextId++}`;
  errorState: boolean;
  shouldLabelFloat: boolean;
  matcher = new DropdownErrorStateMatcher();
  control: FormControl;
  filteredOptions: T[] = [];
  selectedOption: T;
  searchKey = '';

  // tslint:disable-next-line:no-empty
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange = (_) => {};
  // tslint:disable-next-line:no-empty
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouch = (_) => {};

  ngOnInit() {
    this.filteredOptions = this.options;
    this.control = this._controlName?.control || new FormControl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']?.currentValue) {
      this.filteredOptions = this.options;
    }
  }

  registerOnChange(fn: () => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouch = fn;
  }

  writeValue(selected: T) {
    if (selected) {
      this.selectedOption = selected;
      if (selected.value) {
        this.onChange(selected.value);
      } else {
        this.onChange(selected);
      }
    }
  }

  onChanged(selected: MatSelectChange): void {
    this.writeValue(selected.value);
    this.changed.emit(selected.value);
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1?.value === o2?.value;
  }

  filterOptions(searchKey: string) {
    this.filteredOptions = this.options.filter(
      (option) => option?.name.toLocaleLowerCase('tr').indexOf(searchKey.toLocaleLowerCase('tr')) > -1
    );
  }

  onClose() {
    this.searchKey = '';
    this.filteredOptions = this.options;
  }

  // tslint:disable-next-line:no-empty
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onContainerClick(event: MouseEvent): void {}

  setDescribedByIds(ids: string[]): void {
    // tslint:disable-next-line:no-non-null-assertion
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const controlElement = this._elementRef.nativeElement.querySelector('mat-select')!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  getPanelClasses(): string[] {
    return this.scrollable ? ['dropdown-panel'] : ['dropdown-panel', 'non-scrollable'];
  }
}
