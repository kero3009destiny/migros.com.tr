import { SeoConfigModel } from '../../models'
import { InjectionToken } from '@angular/core'

export const SEO_PROVIDERS = new InjectionToken<SeoProviderService>('SeoProvider')

export interface SeoProviderService {
  updateTags(config: SeoConfigModel): void
}