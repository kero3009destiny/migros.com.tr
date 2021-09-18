import { SeoProviderService } from '../seo-provider.service'
import { Meta } from '@angular/platform-browser'
import { Injectable } from '@angular/core'
import { SeoConfigModel } from '../../../models'

@Injectable()
export class OgSeoProviderService implements SeoProviderService {
  constructor(private _meta: Meta) {
  }

  updateTags(config: SeoConfigModel): void {
    this._meta.updateTag({ property: 'og:type', content: 'article' })
    this._meta.updateTag({ property: 'og:site_name', content: config.site })
    this._meta.updateTag({ property: 'og:title', content: config.title })
    this._meta.updateTag({ property: 'og:description', content: config.description })
    this._meta.updateTag({ property: 'og:image', content: config.image })
    this._meta.updateTag({ property: 'og:price:amount', content: config.product.price })

    const contentPath = `${(window as any).location.origin}${config.slug}`
    this._meta.updateTag({
      property: 'og:url',
      content: contentPath,
    })
  }

}