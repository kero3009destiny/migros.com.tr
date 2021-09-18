import { registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeTr from '@angular/common/locales/tr';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import {
  AppInitService,
  CoreModule,
  EventReferenceInterceptor,
  RELEASE_INFO,
  SEO_CONFIG,
  RequestInterceptor,
} from '@fe-commerce/core';
import { EnvServiceModule } from '@fe-commerce/env-service';
import { MdcComponentsModule } from '@fe-commerce/mdc-components';
import { ProductModule as LibProductModule } from '@fe-commerce/product';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApiModule, Configuration, ConfigurationParameters } from '@migroscomtr/sanalmarket-angular';

import { SmAppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule as SmSharedModule } from './shared';

window.__env = window.__env || {};

export function initializeAppFactory(appInitService: AppInitService) {
  return (): Promise<unknown> => appInitService.init();
}

const apiConfigFactory = (): Configuration => {
  const params: ConfigurationParameters = {
    basePath: window.__env.baseUrl,
  };
  return new Configuration(params);
};

registerLocaleData(localeTr);

@NgModule({
  declarations: [AppComponent],
  imports: [
    ApiModule.forRoot(apiConfigFactory),
    FontAwesomeModule,
    //
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: window.__env.serviceWorker }),
    //
    CoreModule,
    EnvServiceModule,
    //
    SmAppRoutingModule,
    SmSharedModule,
    MdcComponentsModule,
    LibProductModule,
  ],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [AppInitService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: EventReferenceInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'tr' },
    {
      provide: SEO_CONFIG,
      useValue: {
        title: 'Migros',
        site: '@migros_tr',
        iosAppLink: 'app-id=397585390, app-argument=sanalmarket:/',
        description: '',
        image: 'https://migros-dali-storage-prod.global.ssl.fastly.net/sanalmarket/custom/sanalmarket-seo-34706362.png',
        slug: '',
        product: {
          price: null,
          amount: null,
        },
      },
    },
    {
      provide: RELEASE_INFO,
      useValue: {
        title: 'Sanalmarket her gün gelişiyor.',
        message: `Web sitemiz güncellendi.`,
        state: 'information',
        confirmMessage: 'Alışverişe Başla',
        showCancelButton: false,
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
