import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { SharedModule } from '@fe-commerce/shared';

import { CoreModule as SmCoreModule } from '../core';
import { SharedModule as SmSharedModule } from '../shared';

import { SmAuthRoutingModule } from './auth-routing.module';
import { AuthComponent, LoginFaqsComponent } from './components';
import { EmailUnsubscribePage, ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages';

@NgModule({
  declarations: [
    AuthComponent,
    LoginPage,
    ForgotPasswordPage,
    RegisterPage,
    ResetPasswordPage,
    LoginFaqsComponent,
    EmailUnsubscribePage,
  ],
  imports: [
    CommonModule,
    SmAuthRoutingModule,
    ReactiveFormsModule,
    MdcComponentsModule,
    SharedModule,
    SmSharedModule,
    SmCoreModule,
    CommonModule,
  ],
  exports: [],
})
export class SmAuthModule {}
