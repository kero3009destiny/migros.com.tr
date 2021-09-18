import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material-experimental/mdc-button';

import { MaterialModule, SharedModule } from '@fe-commerce/shared';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CookieService } from 'ngx-cookie-service';

import {
  AgreementDialogComponent,
  DialogComponent,
  ShortfallProductListComponent,
  SpinnerComponent,
  AnonymousLoginDialogComponent,
  NotFoundComponent,
} from './components';
import { GtmDirective } from './directives';
import { OtpDialogComponent } from './directives/otp-dialog/otp-dialog.component';
import { ErrorModule } from './error/error.module';
import { AuthCredentialsInterceptor } from './interceptors/auth-credentials.interceptor';
import { OgSeoProviderService } from './services/seo/internals/og-seo-provider.service';
import { TwitterSeoProviderService } from './services/seo/internals/twitter-seo-provider.service';
import { SEO_PROVIDERS } from './services';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    ErrorModule,
    MaterialModule,
    PortalModule,
    MatButtonModule,
    FontAwesomeModule,
  ],
  declarations: [
    AgreementDialogComponent,
    DialogComponent,
    ShortfallProductListComponent,
    SpinnerComponent,
    GtmDirective,
    OtpDialogComponent,
    AnonymousLoginDialogComponent,
    NotFoundComponent,
  ],
  providers: [
    {
      provide: SEO_PROVIDERS,
      useClass: TwitterSeoProviderService,
      multi: true,
    },
    {
      provide: SEO_PROVIDERS,
      useClass: OgSeoProviderService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthCredentialsInterceptor,
      multi: true,
    },
    CookieService,
  ],
  exports: [
    AgreementDialogComponent,
    DialogComponent,
    ShortfallProductListComponent,
    SpinnerComponent,
    OtpDialogComponent,
    GtmDirective,
    NotFoundComponent,
  ],
})
export class CoreModule {}
