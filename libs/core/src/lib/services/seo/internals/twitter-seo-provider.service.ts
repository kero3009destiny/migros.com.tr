import { SeoProviderService } from '../seo-provider.service'
import { Meta } from '@angular/platform-browser'
import { Injectable } from '@angular/core'
import { SeoConfigModel } from '../../../models'

@Injectable()
export class TwitterSeoProviderService implements SeoProviderService {

  constructor(private _meta: Meta) {
  }

  updateTags(config: SeoConfigModel): void {
    this._meta.updateTag({ name: 'twitter:card', content: 'summary' })
    this._meta.updateTag({ name: 'twitter:site', content: config.site })
    this._meta.updateTag({ name: 'twitter:title', content: config.title })
    this._meta.updateTag({ name: 'twitter:description', content: config.description })
    this._meta.updateTag({ name: 'twitter:image', content: config.image })
    this._meta.updateTag({ name: 'twitter:price', content: config.product.price })
  }
}