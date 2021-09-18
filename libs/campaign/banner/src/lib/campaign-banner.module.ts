import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MdcComponentsModule } from '@fe-commerce/mdc-components';

import { BannerComponent, SideBannerComponent } from './components';
import { SideBannerCardComponent } from './components/side-banner-card/side-banner-card.component';

@NgModule({
  imports: [CommonModule, RouterModule, MdcComponentsModule],
  declarations: [BannerComponent, SideBannerComponent, SideBannerCardComponent],
  exports: [BannerComponent, SideBannerComponent, SideBannerCardComponent],
})
export class CampaignBannerModule {}
