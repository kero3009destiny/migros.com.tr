import { Component, OnInit, ChangeDetectorRef, Input, AfterViewInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { Browser } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';
import { GtmDataModel, ProductInfoModel } from '@fe-commerce/shared';
import { faChevronRight } from '@fortawesome/pro-light-svg-icons';
import {
  HomeScreenDTO,
  CartInfoDTO,
  ShoppingListDTO,
  CartItemInfoDTO,
  StoreProductInfoDTO,
} from '@migroscomtr/sanalmarket-angular';
import { ROUTE_MEMBERSHIP, ROUTE_USER_ORDERS } from 'apps/sanalmarket-frontend-project/src/app/routes';

@Component({
  selector: 'sm-product-list-slider',
  templateUrl: './product-list-slider.component.html',
  styleUrls: ['./product-list-slider.component.scss'],
})
export class ProductListSliderComponent implements OnInit, AfterViewInit {
  @Input() itemInfos: StoreProductInfoDTO[];
  @Input() title: string;
  @Input() listAlign: 'vertical' | 'horizontal' = 'horizontal';

  @ViewChild('container') container: MatTabGroup;

  // ICON
  faChevronRight = faChevronRight;

  // DATA
  private _homeScreenData: HomeScreenDTO;
  private _cartInfo: CartInfoDTO;

  // STATE
  private selectedTabShoppingList: ShoppingListDTO;
  private readonly containerItemThreshold = 5;

  constructor(private _router: Router, private _cdr: ChangeDetectorRef, private _cartService: CartService) {}

  getCartItem(product: StoreProductInfoDTO): CartItemInfoDTO {
    return this._cartInfo.itemInfos?.find((cartItemInfo) => cartItemInfo.product.sku === product.sku);
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

  getTabShoppingLists(): ShoppingListDTO[] {
    return this._homeScreenData?.tabShoppingLists;
  }

  isArrowButtonsVisible(length: number): boolean {
    return length > this.containerItemThreshold;
  }
  isMobile(): boolean {
    return Browser.isMobile();
  }

  ngOnInit(): void {
    this.subscribeToCart();
  }

  ngAfterViewInit(): void {
    this.hideTabHeader();
  }

  onClickShoppingListSeeAllBtn(): void {
    const route =
      this.selectedTabShoppingList.customId === 'LAST_ORDERS'
        ? `${ROUTE_MEMBERSHIP}/${ROUTE_USER_ORDERS}`
        : '/' + this.selectedTabShoppingList.prettyName;
    this._router.navigate([route], {
      state: { referrerEventId: this.selectedTabShoppingList.referrerEventId },
    });
  }

  onTabShoppingListChanged(event: MatTabChangeEvent): void {
    this.selectedTabShoppingList = this._homeScreenData.tabShoppingLists[event.index];
  }

  hideTabHeader(): void {
    const header: HTMLElement = (this.container?._tabHeader as any)?._elementRef.nativeElement;
    if (this.container && header) {
      header.style.display = 'none';
    }
  }

  subscribeToCart(): void {
    this._cartService.cart$.subscribe((cartInfo) => {
      this._cartInfo = cartInfo;
      this._cdr.detectChanges();
    });
  }

  scrollTo(container: MatTabGroup, direction: 'left' | 'right'): void {
    // this function handles prev, next button functionality, uses scrollBy method.
    // it separates logic with checking containers whether items is in matTab or HTMLElement.

    const offsetWidth = container._tabBodyWrapper.nativeElement.offsetWidth;
    const selectedMatTabBody = Array.from(container._tabBodyWrapper.nativeElement.children).filter(
      (element: HTMLElement) => {
        return element.classList.contains('mat-mdc-tab-body-active');
      }
    )[0] as HTMLElement;

    selectedMatTabBody.firstElementChild.scrollBy({
      behavior: 'smooth',
      left: direction === 'left' ? -offsetWidth : offsetWidth,
    });

    this._cdr.detectChanges();
  }
  trackByFnShoppingList(_index: number, product: StoreProductInfoDTO): number {
    return product.id;
  }
}
