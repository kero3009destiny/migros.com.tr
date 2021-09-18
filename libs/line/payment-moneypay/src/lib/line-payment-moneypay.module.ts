import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CoreModule } from '@fe-commerce/core';
import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { SharedModule } from '@fe-commerce/shared';

import { MoneyPayComponent, MoneyPayOptionsComponent, MoneyPayOtpDialogComponent } from './components';

@NgModule({
  imports: [CommonModule, MdcComponentsModule, SharedModule, CoreModule],
  declarations: [MoneyPayOptionsComponent, MoneyPayComponent, MoneyPayOtpDialogComponent],
  exports: [MoneyPayComponent],
})
export class LinePaymentMoneypayModule {}
