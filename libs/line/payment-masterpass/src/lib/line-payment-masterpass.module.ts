import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CampaignInstantDiscountModule } from '@fe-commerce/campaign-instant-discount';
import { LinePaymentModule } from '@fe-commerce/line-payment';
import { MaterialModule, SharedModule } from '@fe-commerce/shared';

import {
  MasterpassCheckUserComponent,
  MasterpassLinkUserComponent,
  MasterpassListCardsComponent,
  MasterpassOtpModalComponent,
  MasterpassPurchaseComponent,
  MasterpassRegisterComponent,
  MasterpassWrapperComponent,
} from './components';
import { MasterpassOtpService, MasterpassService } from './services';

export interface Config {
  otpService: Type<MasterpassOtpService>;
}

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    LinePaymentModule,
    MaterialModule,
    CampaignInstantDiscountModule,
  ],
  declarations: [
    MasterpassListCardsComponent,
    MasterpassCheckUserComponent,
    MasterpassLinkUserComponent,
    MasterpassOtpModalComponent,
    MasterpassRegisterComponent,
    MasterpassWrapperComponent,
    MasterpassPurchaseComponent,
  ],
  exports: [MasterpassWrapperComponent, MasterpassCheckUserComponent, MasterpassPurchaseComponent],
})
export class LinePaymentMasterpassModule {
  static forRoot(config?: Config): ModuleWithProviders<LinePaymentMasterpassModule> {
    return {
      ngModule: LinePaymentMasterpassModule,
      providers: [
        MasterpassService,
        { provide: MasterpassOtpService, useClass: config?.otpService || MasterpassOtpService },
      ],
    };
  }
}
