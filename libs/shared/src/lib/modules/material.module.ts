import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material-experimental/mdc-dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  exports: [
    MatToolbarModule,
    MatMenuModule,
    MatInputModule,
    MatCheckboxModule,
    MatCardModule,
    MatSidenavModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
    MatExpansionModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatAutocompleteModule,
  ],
})
export class MaterialModule {}
