import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { FormatPricePipe } from '@fe-commerce/shared';

import { StoreProductInfoDTO } from '@migroscomtr/sanalmarket-angular';

/** @dynamic */
@Injectable({
  providedIn: 'root',
})
export class JsonLdService {
  private readonly SCRIPT_TYPE = 'application/json+ld';

  private _script: HTMLScriptElement;
  private _formatPricePipe: FormatPricePipe;

  constructor(@Inject(DOCUMENT) private _document: Document) {
    this._formatPricePipe = new FormatPricePipe();
  }

  insertSchema(spi: StoreProductInfoDTO): void {
    const script = this._document.createElement('script');
    script.type = this.SCRIPT_TYPE;
    script.text = this._createSchema(spi);
    this._document.head.appendChild(script);
    this._script = script;
  }

  removeSchema() {
    this._document.head.removeChild(this._script);
    this._script = null;
  }

  private _createSchema(spi: StoreProductInfoDTO): string {
    const itemListElements = [...spi.categoryAscendants.reverse(), spi.category].map((category, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        // @ts-expect-error //TODO Find out why prettyName does not exist
        '@id': `https://www.migros.com.tr/${category.prettyName}`,
        name: `${category.name}`,
      },
    }));
    //
    const categoryNames = spi.categoryAscendants
      .map((category) => category.name)
      .reduce((prev, curr) => `${prev}/${curr}`, '');
    //
    const images = spi.images
      .map((image) => image.urls.PRODUCT_DETAIL)
      .map((imageUrl) => ({
        '@type': 'ImageObject',
        contentUrl: imageUrl,
        caption: spi.name,
      }));
    //
    const json = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',

      name: `${spi.name} - Migros`,
      description: spi.description,
      url: `https://www.migros.com.tr/${spi.prettyName}`,
      inLanguage: 'tr-TR',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        numberOfItems: itemListElements.length,
        itemListElement: itemListElements,
      },
      mainEntity: {
        '@type': 'WebPageElement',
        offers: {
          '@type': 'Offer',
          itemOffered: [
            {
              '@type': 'Product',
              name: spi.name,
              url: `https://www.migros.com.tr/${spi.prettyName}`,
              category: categoryNames,
              brand: {
                '@type': 'Brand',
                name: spi.brand.name,
              },
              image: images,
              offers: {
                '@type': 'Offer',
                itemCondition: 'https://schema.org/NewCondition',
                image: spi.images[0].urls.PRODUCT_DETAIL,
                availability: 'https://schema.org/InStock',
                category: categoryNames,
                price: `${this._formatPricePipe.transform(Math.min(spi.salePrice, spi.loyaltyPrice))}`,
                priceCurrency: 'TRY',
                areaServed: 'TR',
                seller: {
                  '@type': 'Organization',
                  name: 'Migros Sanalmarket',
                  logo:
                    'https://migros-dali-storage-prod.global.ssl.fastly.net/sanalmarket/custom/sanalmarket-logo-19f64f04.svg',
                },
              },
            },
          ],
        },
      },
    };

    return JSON.stringify(json);
  }
}
