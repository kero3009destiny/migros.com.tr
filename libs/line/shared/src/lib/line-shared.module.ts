import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@fe-commerce/shared';

import { LineSummaryComponent, LineSummaryPriceInfoComponent } from './components';

@NgModule({
  declarations: [LineSummaryComponent, LineSummaryPriceInfoComponent],
  imports: [CommonModule, SharedModule],
  exports: [LineSummaryComponent, LineSummaryPriceInfoComponent],
})
export class LineSharedModule {}
