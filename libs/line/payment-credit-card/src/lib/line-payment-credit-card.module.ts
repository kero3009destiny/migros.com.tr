import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { SharedModule } from '@fe-commerce/shared';

import { CardInstallmentFormComponent } from './components/card-installment-form/card-installment-form.component';
import { CardProvisionInfoComponent } from './components/card-provision-info/card-provision-info.component';

@NgModule({
  imports: [CommonModule, SharedModule, MdcComponentsModule],
  declarations: [CardInstallmentFormComponent, CardProvisionInfoComponent],
  exports: [CardInstallmentFormComponent, CardProvisionInfoComponent],
})
export class LinePaymentCreditCardModule {}
