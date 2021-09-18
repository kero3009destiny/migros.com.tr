import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { EnvServiceProvider } from './providers/env.service.provider'

declare global {
  interface Window {
    __env: any
  }
}

window.__env = window.__env || {}

@NgModule({
  imports: [CommonModule],
  providers: [EnvServiceProvider],
})
export class EnvServiceModule {}
