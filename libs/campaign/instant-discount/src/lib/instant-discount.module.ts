import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@fe-commerce/shared';

import { InstantDiscountComponent } from './components';

@NgModule({
  imports: [CommonModule, SharedModule],
  exports: [InstantDiscountComponent],
  declarations: [InstantDiscountComponent],
})
export class CampaignInstantDiscountModule {}
