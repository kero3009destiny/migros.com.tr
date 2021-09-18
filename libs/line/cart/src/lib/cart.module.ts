import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { MaterialModule, SharedModule } from '@fe-commerce/shared';

import { CartPageItemComponent, ProductNoteDialogComponent, AnonymousLoginRedirectComponent } from './components';

@NgModule({
  declarations: [CartPageItemComponent, ProductNoteDialogComponent, AnonymousLoginRedirectComponent],
  imports: [CommonModule, SharedModule, MatButtonModule, ReactiveFormsModule, MaterialModule],
  providers: [DecimalPipe],
  exports: [CartPageItemComponent, AnonymousLoginRedirectComponent],
})
export class CartModule {}
