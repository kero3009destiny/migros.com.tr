import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'

declare global {
  interface Window {
    __env: any
  }
}

window.__env = window.__env || {}

if (window.__env.production) {
  enableProdMode()
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err))
