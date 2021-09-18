import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material-experimental/mdc-button';
import { MatCardModule } from '@angular/material-experimental/mdc-card';
import { MatCheckboxModule } from '@angular/material-experimental/mdc-checkbox';
import { MatOptionModule } from '@angular/material-experimental/mdc-core';
import { MatDialogModule } from '@angular/material-experimental/mdc-dialog';
import { MatFormFieldModule } from '@angular/material-experimental/mdc-form-field';
import { MatInputModule } from '@angular/material-experimental/mdc-input';
import { MatListModule } from '@angular/material-experimental/mdc-list';
import { MatRadioModule } from '@angular/material-experimental/mdc-radio';
import { MatSelectModule } from '@angular/material-experimental/mdc-select';
import { MatSlideToggleModule } from '@angular/material-experimental/mdc-slide-toggle';
import { MatSnackBarModule } from '@angular/material-experimental/mdc-snack-bar';
import { MatTableModule } from '@angular/material-experimental/mdc-table';
import { MatTabsModule } from '@angular/material-experimental/mdc-tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ButtonComponent } from './button/button.component';
import { MdcMaskedInputDirective, MdcMaskedPriceDirective } from './directives';
import { DropdownComponent } from './dropdown/dropdown.component';
import { IconButtonComponent } from './icon-button/icon-button.component';
import { InputTelephoneComponent } from './input-telephone/input-telephone.component';
import { SelectableCardComponent } from './selectable-card/selectable-card.component';

const DIRECTIVES = [MdcMaskedInputDirective, MdcMaskedPriceDirective];

const COMPONENTS = [
  ButtonComponent,
  SelectableCardComponent,
  DropdownComponent,
  IconButtonComponent,
  InputTelephoneComponent,
];

const MATERIAL_EXPERIMENTAL_MODULES = [
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSlideToggleModule,
  MatDialogModule,
  MatCheckboxModule,
  MatListModule,
  MatRadioModule,
  MatOptionModule,
  MatSelectModule,
  MatTableModule,
  MatTabsModule,
  MatSnackBarModule,
];

/**
 * @deprecated remove when these modules will be implemented by mdc-experimental
 */
const MATERIAL_MODULES = [MatChipsModule, MatDividerModule, MatTooltipModule, MatExpansionModule, MatDatepickerModule];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
    MATERIAL_EXPERIMENTAL_MODULES,
    MATERIAL_MODULES,
  ],
  declarations: [COMPONENTS, DIRECTIVES],
  exports: [
    COMPONENTS,
    DIRECTIVES,
    // Modules
    MATERIAL_EXPERIMENTAL_MODULES,
    FontAwesomeModule,
    //
    MATERIAL_MODULES,
  ],
})
export class MdcComponentsModule {}
