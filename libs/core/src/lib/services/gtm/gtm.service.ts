import { Injectable } from '@angular/core';

import { BannerModel, FormatAmountPipe, FormatPricePipe, FormatUnitPipe, GtmProductModel } from '@fe-commerce/shared';

import { buffer, debounceTime } from 'rxjs/operators';

import { Subject } from 'rxjs';
import {
  CampaignDTO,
  SimpleProductDTO,
  SimpleStoreProductInfoDTO,
  StoreProductInfoDTO,
} from '@migroscomtr/sanalmarket-angular';

declare let dataLayer: any;
// eslint-disable-next-line prefer-rest-params
function gtag(...args) {
  // eslint-disable-next-line prefer-rest-params
  dataLayer.push(arguments);
}

interface GtmEventInfoModel {
  product?: SimpleProductDTO & StoreProductInfoDTO;
  list?: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class GtmService {
  isActive = false;
  private _productImpressions = new Subject();
  constructor(
    private _formatPrice: FormatPricePipe,
    private _formatQuantity: FormatAmountPipe,
    private _formatUnit: FormatUnitPipe
  ) {}

  init({ GTM_ID }) {
    this.isActive = true;
    this.injectGTM(window as any, document as any, 'script', 'dataLayer', GTM_ID);
    this.initImpressionService();
  }

  injectGTM(window, document, scriptTag, dataLayerTag, gtmId) {
    window[dataLayerTag] = window[dataLayerTag] || [];
    window[dataLayerTag].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const f = document.getElementsByTagName(scriptTag)[0],
      j = document.createElement(scriptTag),
      dl = dataLayerTag !== 'dataLayer' ? '&l=' + dataLayerTag : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + gtmId + dl;
    f.parentNode.insertBefore(j, f);
  }

  updateConsentGoogleAnalytics(deny: boolean): void {
    gtag('consent', 'update', {
      analytics_storage: deny ? 'denied' : 'granted',
    });
  }

  updateConsentAdStorage(deny: boolean): void {
    gtag('consent', 'update', {
      ad_storage: deny ? 'denied' : 'granted',
    });
  }

  generateGtmProductData(
    product: SimpleProductDTO & StoreProductInfoDTO,
    position: number,
    list: string,
    quantity?: number,
    totalDiscount?: number,
    secondaryUnit?: string
  ): GtmProductModel {
    const { name, shownPrice, regularPrice, images, brand, brandName, sku, warehouseId, status, storeId } = product;
    const gtmProductDataCategories = this.getGtmProductDataCategories(product);
    const unit = secondaryUnit ? secondaryUnit : product.unit;
    const { availability, stockout } = this.getStockoutInfo(status);
    return {
      name,
      id: sku,
      price: unit === 'GRAM' ? this.getPricePerGram(shownPrice) : this._formatPrice.transform(shownPrice, '.'),
      brand: brand ? brand.name : brandName,
      category: gtmProductDataCategories,
      categories: gtmProductDataCategories,
      discountedPrice: this._formatPrice.transform(regularPrice, '.'),
      discount: this._formatPrice.transform(totalDiscount, '.'),
      list: list || '',
      imageUrl: images[0].urls.PRODUCT_DETAIL,
      position,
      quantity: quantity,
      unit: this._formatUnit.transform(unit, true),
      warehouseId,
      availability,
      stockout,
      storeId,
    };
  }

  getStockoutInfo(status: SimpleStoreProductInfoDTO.StatusEnum): { availability: string; stockout: number } {
    switch (status) {
      case SimpleStoreProductInfoDTO.StatusEnum.StockOut:
        return {
          availability: 'stockout',
          stockout: 1,
        };

      case SimpleStoreProductInfoDTO.StatusEnum.Delist:
        return {
          availability: 'delist',
          stockout: 1,
        };

      default:
        return {
          availability: 'in sale',
          stockout: 0,
        };
    }
  }

  getPricePerGram(value: number): string {
    // sending price to the gtm is different while sending with 'gram' unit,
    // we have to calculate price per gram, -> value / quantity.
    value = value / 1000;
    return (value / 100)
      .toLocaleString('tr-TR', {
        maximumFractionDigits: 10,
        minimumFractionDigits: 5,
      })
      .replace(',', '.');
  }

  getGtmProductDataCategories(product: SimpleProductDTO & StoreProductInfoDTO) {
    const { categoryAscendants, ascendantCategoriesNames } = product;
    if (categoryAscendants) {
      return categoryAscendants
        .map((categoryAscendantsModel) => categoryAscendantsModel.name)
        .reverse()
        .join('/');
    } else if (ascendantCategoriesNames) {
      return ascendantCategoriesNames.reduce((acc, name) => `${acc}/${name}`, '');
    } else {
      return '';
    }
  }

  generateProductImpressionsArray(products: Array<SimpleProductDTO & StoreProductInfoDTO>, list: string) {
    return products.map((product, index: number) => {
      return this.generateGtmProductData(product, index, list);
    });
  }

  generateBannerClickObject(banner: BannerModel, index: number) {
    return {
      id: banner.id,
      name: banner.identifier,
      position: index,
    };
  }

  updateDataLayer(value) {
    dataLayer.push(value);
  }

  initImpressionService() {
    const productsBuff$ = this._productImpressions.pipe(debounceTime(100));
    const productImpressions$ = this._productImpressions.pipe(buffer(productsBuff$));

    productImpressions$.subscribe((gtmEventInfos: Array<GtmEventInfoModel>) => {
      const products = gtmEventInfos.map((event) => event.product);
      const list = gtmEventInfos[0].list;

      this.sendProductImpressions(products, list);
    });
  }

  getProductImpression(eventData) {
    this._productImpressions.next(eventData);
  }

  sendProductImpressions(products: Array<SimpleProductDTO & StoreProductInfoDTO>, list: string) {
    if (!this.isActive) {
      return false;
    }
    const data = {
      event: 'ecommerceProductImpression',
      nonInteraction: true,
      eventType: 'Product Impression',
      ecommerce: {
        impressions: this.generateProductImpressionsArray(products, list),
      },
    };
    this.updateDataLayer(data);
  }

  sendProductClickEvent({ product, list }) {
    if (!this.isActive) {
      return false;
    }
    const data = {
      event: 'ecommerceProductClick',
      nonInteraction: false,
      eventType: 'Product Click',
      ecommerce: {
        click: { products: [this.generateGtmProductData(product, 0, list)] },
      },
    };
    this.updateDataLayer(data);
  }

  sendProductDetail(product: GtmProductModel) {
    if (!this.isActive) {
      return false;
    }
    const data = {
      event: 'ecommerceProductDetail',
      eventType: 'Product Detail',
      nonInteraction: true,
      ecommerce: {
        detail: {
          products: [product],
        },
      },
    };
    this.updateDataLayer(data);
  }

  sendErrorEvent(errorCode: number): boolean | void {
    if (!this.isActive) {
      return false;
    }
    const data = {
      event: `error${errorCode}`,
      eventType: 'action',
      nonInteraction: true,
    };
    this.updateDataLayer(data);
  }

  sendProductAddFavouriteEvent(productId: number): void {
    if (!this.isActive) {
      return;
    }

    const data = {
      event: 'Add',
      eventType: 'Favourite',
      nonInteraction: false,
      ecommerce: {
        productId: productId,
      },
    };
    this.updateDataLayer(data);
  }

  sendBannerEvent(type, banner: BannerModel, index: number) {
    if (!this.isActive) {
      return false;
    }
    const eventType = type === 'promoClick' ? 'Promotion Click' : 'Promotion Impression';
    const eventTail = eventType.replace(/\s/g, '');
    const data = {
      event: `ecommerce${eventTail}`,
      eventType,
      nonInteraction: type !== 'promoClick',
      ecommerce: {
        [type]: { promotions: [this.generateBannerClickObject(banner, index + 1)] },
      },
    };
    this.updateDataLayer(data);
  }

  sendCartOperation(type: string, gtmProduct: GtmProductModel) {
    if (!this.isActive) {
      return false;
    }
    const eventType = type === 'add' ? 'Add to Cart' : 'Remove from Cart';
    const eventTail = type === 'add' ? 'AddToCart' : 'RemoveFromCart';
    const data = {
      event: `ecommerce${eventTail}`,
      eventType,
      nonInteraction: false,
      ecommerce: { [type]: { products: [gtmProduct] } },
    };
    this.updateDataLayer(data);
  }

  sendCheckoutEvent(data) {
    if (!this.isActive) {
      return false;
    }
    this.updateDataLayer(data);
  }

  sendPageView(data) {
    if (!this.isActive) {
      return false;
    }
    this.updateDataLayer(data);
  }

  sendRegisterEvent(data) {
    if (!this.isActive) {
      return false;
    }
    this.updateDataLayer(data);
  }

  sendCrmPromotionAddClickEvent(campaign: CampaignDTO): void {
    const data = {
      event: 'ecommerceCrmPromotionAddClick',
      nonInteraction: false,
      eventType: 'Crm Promotion Add Click',
      ecommerce: {
        click: { campaign: campaign },
      },
    };
    this.updateDataLayer(data);
  }
}
