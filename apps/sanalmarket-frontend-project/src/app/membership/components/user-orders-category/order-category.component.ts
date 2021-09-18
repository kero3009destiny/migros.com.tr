import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { LoadingIndicatorService } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';
import { DoughnutChart } from '@fe-commerce/shared';

import { filter } from 'rxjs/operators';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown, faChevronUp, faPlus } from '@fortawesome/pro-regular-svg-icons';
import { CategorizedOrderItemInfos, OrderRestControllerService } from '@migroscomtr/sanalmarket-angular';

import { ITimeOption } from '../../models/user-orders-category.interface';

@Component({
  selector: 'sm-user-orders-category',
  templateUrl: './order-category.component.html',
  styleUrls: ['./order-category.component.scss'],
})
export class OrderCategoryComponent implements OnInit {
  // CONSTANTS
  private readonly timeOptions: ITimeOption[] = [
    { name: 'Son 1 Ay', value: 1 },
    { name: 'Son 3 Ay', value: 3 },
    { name: 'Son 6 Ay', value: 6 },
    { name: 'Son 1 Yıl', value: 12 },
  ];
  private readonly colorList = [
    '#ED5650',
    '#FB9A39',
    '#F27E89',
    '#FCCB43',
    '#745CA1',
    '#6088F8',
    '#88D0C4',
    '#86C27D',
    '#f75b39',
    '#30a6e3',
    '#e62867',
    '#fdb615',
    '#2ecd8c',
  ];

  // DATA
  private chartValues: DoughnutChart;
  private categoryList: CategorizedOrderItemInfos[];
  private categoryNames: string[] = [];
  private deliveryZoneFormGroup: FormGroup;

  // STATES
  private _isLoading = true;

  // ICONS
  plusIcon: IconDefinition = faPlus;
  chevronDownIcon: IconDefinition = faChevronDown;
  chevronUpIcon: IconDefinition = faChevronUp;

  constructor(
    private _cartService: CartService,
    private _formBuilder: FormBuilder,
    private _orderRestService: OrderRestControllerService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.fetchChartData();
  }

  getCategoryList(): CategorizedOrderItemInfos[] {
    return this.categoryList;
  }
  getCategoryNames(): string[] {
    return this.categoryNames;
  }

  getChartValues(): DoughnutChart {
    return this.chartValues;
  }

  getColor(index: number): string {
    return this.colorList[index];
  }

  getColorList(): string[] {
    return this.colorList;
  }

  getTimeIntervalText(): string {
    const time = this.deliveryZoneFormGroup.value.time;
    return time === 999 ? 'Şu ana kadar' : `Son ${time} ay içerisinde`;
  }
  getTimeOptions(): ITimeOption[] {
    return this.timeOptions;
  }

  isChartVisible(): boolean {
    return !this.showNoData() && !this.isLoading();
  }
  isErrorVisible(): boolean {
    return this.showNoData() && !this.isLoading();
  }
  isLoading(): boolean {
    return this._isLoading;
  }

  showNoData(): boolean {
    return !this._isLoading && this.categoryList?.length === 0;
  }

  private buildForm(): void {
    this.deliveryZoneFormGroup = this._formBuilder.group({
      time: [{ value: 1, disabled: false }, [Validators.required]],
    });
  }

  fetchChartData(months?: number): void {
    this._isLoading = true;
    this._loadingIndicatorService.start();
    this._orderRestService
      .getCategorizedOrderItems(months, 0, 10000)
      .pipe(filter((res) => !!res.data))
      .subscribe((res) => {
        this._loadingIndicatorService.stop();
        if (!res.data.length) {
          this.categoryList = [];
          this._isLoading = false;
          this.cd.detectChanges();
          return;
        }

        this.categoryList = res.data;
        this.categoryNames = this.categoryList.map((category) => category.categoryName);

        let totalItemCount = 0;
        this.categoryList.forEach((category) => {
          totalItemCount += category.itemInfos.length;
        });

        this.chartValues = {
          chartLabel: this.categoryNames,
          chartData: this.categoryList.map((category) => {
            const percentage = category.itemInfos.length / totalItemCount;
            const normalValue = Math.round(percentage * 100);
            return normalValue;
          }),
        };

        // check if the products are already in the cart and update their amounts
        this._cartService.cartItems$.subscribe((cartItemInfos) => {
          this.categoryList.forEach((category) => {
            category.itemInfos.forEach((itemInfo) => {
              for (const cartItemInfo of cartItemInfos) {
                if (itemInfo.item.productId === cartItemInfo.item.productId) {
                  itemInfo.item.amount = cartItemInfo.item.amount;
                  return;
                }
              }
              itemInfo.item.amount = 0;
            });
          });

          this.cd.detectChanges();
        });

        this._isLoading = false;
        this.cd.detectChanges();
      });
  }
}
