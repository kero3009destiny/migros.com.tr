import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { Browser } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';
import { GtmDataModel, ProductInfoModel } from '@fe-commerce/shared';

import { filter } from 'rxjs/operators';

import { CartCampaignDTO, CartItemInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-special-discount',
  templateUrl: './special-discount.component.html',
  styleUrls: ['./special-discount.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SpecialDiscountComponent implements OnInit {
  @Input() cartItemInfos: CartItemInfoDTO[];

  private _cartCampaigns: CartCampaignDTO[] = [];
  private _isLoading = true;

  constructor(private _cartService: CartService, private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscribeToCartService();
  }

  isLoading(): boolean {
    return this._isLoading;
  }

  isCartCampaignsEmpty(): boolean {
    return this.getTotalCartCampaignProductsNumber() === 0;
  }

  getTotalCartCampaignProductsNumber(): number {
    return this._cartCampaigns.reduce((acc, cartCampaign) => {
      return acc + cartCampaign.storeProductInfos.length;
    }, 0);
  }

  getCartCampaigns(): CartCampaignDTO[] {
    return this._cartCampaigns.filter((cartCampaign) => cartCampaign.storeProductInfos.length > 0);
  }

  getCartItem(product): CartItemInfoDTO {
    return this.cartItemInfos?.find((cartItemInfo) => cartItemInfo.product.sku === product.sku);
  }

  isDesktop(): boolean {
    return !Browser.isMobile();
  }

  getGtmData(product: ProductInfoModel, listName: string): GtmDataModel[] {
    const gtmListName = 'specialdiscount/' + listName;
    return [
      {
        name: 'impression',
        product,
        list: gtmListName,
      },
    ];
  }

  private subscribeToCartService(): void {
    this._cartService
      .getCartCampaigns$()
      .pipe(filter((cartCampaigns) => !!cartCampaigns))
      .subscribe((cartCampaigns) => {
        this._cartCampaigns = cartCampaigns;
        this._isLoading = false;
        this._changeDetectorRef.detectChanges();
      });
  }
}
