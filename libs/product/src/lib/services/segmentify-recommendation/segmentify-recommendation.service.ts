import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvService } from '@fe-commerce/env-service';
import { SegmentifyProductModel, SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, filter, map, takeUntil } from 'rxjs/operators';

import { BehaviorSubject, EMPTY, fromEvent, Observable } from 'rxjs';
import { CartScreenControllerService, StoreProductInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { SegmentifyAction, SegmentifyProduct, SegmentifyActionType, SegmentifyEvent } from './segmentify.types';

declare let _SgmntfY_: any;

@Injectable()
export class SegmentifyRecommendationService extends SubscriptionAbstract {
  private products$ = new BehaviorSubject<StoreProductInfoDTO[]>([]);
  private campaignId: string;
  private widgetLocation: 'cart' | 'product-detail';
  private queryStringParams = {};
  private segmentifyActionsList = {
    similarProducts: {
      type: SegmentifyActionType.GET,
      affectedObjectName: 'benzer-urunler',
      subject: new BehaviorSubject<StoreProductInfoDTO[]>([]),
    },
    relatedProducts: {
      type: SegmentifyActionType.GET,
      affectedObjectName: 'birlikte-alinan-urunler',
      subject: new BehaviorSubject<StoreProductInfoDTO[]>([]),
    },
    cartRecommendations: {
      type: SegmentifyActionType.GET,
      affectedObjectName: 'sepet-onerileri',
      subject: new BehaviorSubject<StoreProductInfoDTO[]>([]),
    },
  };

  constructor(private _cartScreenControllerService: CartScreenControllerService, private _envService: EnvService) {
    super();
    this.init();
  }

  // RECENT IMPLEMENTATION

  public getSimilarProducts(): Observable<StoreProductInfoDTO[]> {
    return this.segmentifyActionsList.similarProducts.subject.asObservable();
  }

  public getRelatedProducts(): Observable<StoreProductInfoDTO[]> {
    return this.segmentifyActionsList.relatedProducts.subject.asObservable();
  }

  public getCartRecommendations(): Observable<StoreProductInfoDTO[]> {
    return this.segmentifyActionsList.cartRecommendations.subject.asObservable();
  }

  private createEventString(action: SegmentifyAction): string {
    return `segmentify:${action.type}:${action.affectedObjectName}`;
  }

  private init(): void {
    this.listenEvents();
    this.setCampaignId();
  }

  private listenEvents(): void {
    const list = this.segmentifyActionsList;

    for (const action of Object.values(list)) {
      fromEvent(window, this.createEventString(action))
        .pipe(takeUntil(this.getDestroyInterceptor()))
        .subscribe((data: SegmentifyEvent) => {
          this.publishProducts(action, data.detail);
        });
    }
  }

  /**
   * Publishes the given segmentify products over the subject in the SegmentifyAction
   * @param {SegmentifyAction} action its subject property is needed
   * @param {Array<SegmentifyProduct>} segmentifyProducts the list of segmentify products
   */
  private publishProducts(action: SegmentifyAction, segmentifyProducts: SegmentifyProduct[]): void {
    if (!segmentifyProducts || !segmentifyProducts?.length) {
      return;
    }

    const productIds = segmentifyProducts.map((product: SegmentifyProductModel) => parseInt(product.productId, 10));

    this._cartScreenControllerService
      .getCartScreenRecommendations({
        productIds,
        source: 'SEGMENTIFY',
      })
      .pipe(
        catchError((error) => {
          console.error(error);
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        map((response) => response.data),
        filter((data) => data.storeProductInfos.length > 0)
      )
      .subscribe((data) => {
        const productInfos = data.storeProductInfos;
        const mergedProducts = productInfos.map((product) => {
          const segmentifyProduct = segmentifyProducts.find(
            (segProduct: SegmentifyProductModel) => parseInt(segProduct.productId, 10) === product.id
          );

          if (segmentifyProduct) {
            const queryString = segmentifyProduct.url.substring(segmentifyProduct.url.indexOf('?') + 1);
            this.queryStringParams = this.getQueryStringParams(queryString);
          }

          return product;
        });

        action.subject.next(mergedProducts);
      });
  }

  // RECENT IMPLEMENTATION ends

  // COMMON FUNCTIONS

  getQueryParams(): any {
    return this.queryStringParams;
  }

  getQueryStringParams(query: string): any {
    const params = {};
    const httpParams = new HttpParams({ fromString: query });

    httpParams.keys().forEach((key) => {
      params[key] = httpParams.get(key);
    });

    return params;
  }

  setWidgetLocation(page: 'cart' | 'product-detail'): void {
    this.widgetLocation = page;
  }

  setCampaignId(): void {
    if (this._envService.companyName?.includes('Macroonline')) {
      if (this.widgetLocation === 'cart') {
        this.campaignId = 'scn_965c026c82000';
      }
      if (this.widgetLocation === 'product-detail') {
        this.campaignId = 'scn_9432291ba8000';
      }
    }
    if (this._envService.companyName?.includes('Tazedirekt')) {
      if (this.widgetLocation === 'cart') {
        this.campaignId = 'scn_984bf84756000';
      }
      if (this.widgetLocation === 'product-detail') {
        this.campaignId = 'scn_942fee3c74000';
      }
    }
  }

  onProductInteraction(interactionId: string): void {
    _SgmntfY_._variables.segmentifyObj('event:interaction', {
      type: 'click',
      instanceId: this.campaignId,
      interactionId,
      nextPage: 'false',
    });
  }

  onViewWidget(): void {
    _SgmntfY_._variables.segmentifyObj('event:interaction', {
      type: 'widget-view',
      instanceId: this.campaignId,
    });
  }

  // COMMON FUNCTIONS ends

  // OLD IMPLEMENTATION
  // ! Do not delete this section until all fe-* compoenents are renewed, since they are used by these components.

  /**
   * @deprecated
   */
  getProducts(): Observable<StoreProductInfoDTO[]> {
    return this.products$.asObservable();
  }

  /**
   * @deprecated
   */
  initSegmentify(): void {
    this.subscribeToEvent();
    this.setCampaignId();
  }

  /**
   * @deprecated
   */
  subscribeToEvent(): void {
    fromEvent(window, 'segmentify')
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(() => {
        this.getSegmentifyProducts();
      });
  }

  /**
   * @deprecated
   */
  getSegmentifyProducts(): void {
    const segmentifyProducts = (window as any).segmentifyProducts;

    if (segmentifyProducts) {
      const productIds = segmentifyProducts.map((product: SegmentifyProductModel) => parseInt(product.productId, 10));

      this._cartScreenControllerService
        .getCartScreenRecommendations({
          productIds,
          source: 'SEGMENTIFY',
        })
        .pipe(
          catchError((error) => {
            console.error(error);
            return EMPTY;
          }),
          takeUntil(this.getDestroyInterceptor()),
          map((response) => response.data),
          filter((data) => data.storeProductInfos.length > 0)
        )
        .subscribe((data) => {
          const productInfos = data.storeProductInfos;
          const mergedProducts = productInfos.map((product) => {
            const segmentifyProduct = segmentifyProducts.find(
              (segProduct: SegmentifyProductModel) => parseInt(segProduct.productId, 10) === product.id
            );

            if (segmentifyProduct) {
              const queryString = segmentifyProduct.url.substring(segmentifyProduct.url.indexOf('?') + 1);
              this.queryStringParams = this.getQueryStringParams(queryString);
            }

            return product;
          });

          this.products$.next(mergedProducts);
        });
    }
  }

  // OLD IMPLEMENTATION ends
}
