import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { MatSelectChange } from '@angular/material-experimental/mdc-select';
import { Router } from '@angular/router';

import { AppStateService, GtmService, LoadingIndicatorService, PortfolioEnum, UserService } from '@fe-commerce/core';
import { OrderService } from '@fe-commerce/membership';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { finalize, takeUntil, tap } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/pro-light-svg-icons/faTimes';
import { SimpleOrderInfoDTO, UserDTO } from '@migroscomtr/sanalmarket-angular';

import { OrderFeedbackFormDialogComponent } from '../../components/order-feedback-dialog/order-feedback-form-dialog.component';
import { OrderRateDialog } from '../../components/order-rate/order-rate-dialog.component';

type Months =
  | 'Ocak'
  | 'Şubat'
  | 'Mart'
  | 'Nisan'
  | 'Mayıs'
  | 'Haziran'
  | 'Temmuz'
  | 'Ağustos'
  | 'Eylül'
  | 'Ekim'
  | 'Kasım'
  | 'Aralık';

@Component({
  selector: 'sm-orders-page',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class OrdersPage extends SubscriptionAbstract implements OnInit {
  activeOrders: SimpleOrderInfoDTO[];
  filterOptions = [
    { name: 'Son 1 Ay', value: 1 },
    { name: 'Son 3 Ay', value: 3 },
    { name: 'Son 6 Ay', value: 6 },
    { name: 'Son 1 Yıl', value: 12 },
  ];
  selectedFilterOption = this.filterOptions[0].value;
  orderMap: Map<Months, SimpleOrderInfoDTO[]> = new Map<Months, SimpleOrderInfoDTO[]>();

  private _isDetailActive = false;
  private _selectedOrder: SimpleOrderInfoDTO;
  private _months: Months[] = [];
  private _user: UserDTO;
  private _isOrdersEmpty = false;
  private _portfolio = PortfolioEnum.MARKET;

  constructor(
    private _orderService: OrderService,
    private _cdr: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private _userService: UserService,
    private _loadingIndicatorService: LoadingIndicatorService,
    private _gtmService: GtmService,
    private _router: Router,
    private _appStateService: AppStateService
  ) {
    super();
  }

  ngOnInit(): void {
    this._loadingIndicatorService.start();
    this.subscribeToOrderService();
    this.subscribeToUserService();
    this.subscribeToAppStateService();
    this.sendGtmPageViewEvent('Order');
  }

  onChangeFilter(matSelectChange: MatSelectChange): void {
    this.selectedFilterOption = matSelectChange.value;
    this._orderService.fetchUserOrders(this.selectedFilterOption);
  }

  getSelectedOrder(): SimpleOrderInfoDTO {
    return this._selectedOrder;
  }

  getMonths(): Months[] {
    return this._months;
  }

  getYear(month: Months): number {
    return new Date(this.orderMap?.get(month)[0].line.deliveryDate).getFullYear();
  }

  getTimesIcon(): IconProp {
    return faTimes;
  }

  getTabLabel(): string {
    return this._portfolio === PortfolioEnum.KURBAN
      ? 'Kurban'
      : this._portfolio === PortfolioEnum.ELECTRONIC
      ? 'Ekstra'
      : this._portfolio === PortfolioEnum.HEMEN
      ? 'Hemen'
      : 'Sanal Market';
  }

  isDetailActive(): boolean {
    return this._isDetailActive;
  }

  onCloseDetail(): void {
    this._isDetailActive = false;
    this._cdr.detectChanges();
  }

  onDownloadInvoice(orderId: number): void {
    this._orderService.downloadInvoice(orderId);
  }

  onOpenDeliveryForm(orderId: number): void {
    this._orderService.getDeliveryForm(orderId);
  }

  onCancelOrder(order: SimpleOrderInfoDTO, removeDialogTemplateRef): void {
    this._matDialog
      .open(removeDialogTemplateRef, {
        panelClass: ['order-remove-dialog'],
      })
      .afterClosed()
      .subscribe((isCancelApproved) => {
        if (isCancelApproved) {
          this._orderService.cancelOrder(order.line.id, this.selectedFilterOption);
        }
      });
  }

  onOpenOrderFeedback(): void {
    this._matDialog
      .open(OrderFeedbackFormDialogComponent, {
        panelClass: ['wide-dialog', 'mobile-modal', 'sm-order-feedback-form'],
        data: {
          user: this._user,
        },
      })
      .componentInstance.closed.subscribe(() => {
        this._matDialog.closeAll();
      });
  }

  onOpenOrderRateDialog(order: SimpleOrderInfoDTO): void {
    const dialogRef = this._matDialog.open(OrderRateDialog, {
      panelClass: ['wide-dialog', 'mobile-modal', 'order-rate-dialog'],
      data: order.simpleOrderFeedback,
    });

    dialogRef.componentInstance.ratingFormSubmit.subscribe(() => {
      this._orderService.fetchUserOrders(this.selectedFilterOption);
    });
  }

  isOrdersEmpty(): boolean {
    return this._isOrdersEmpty;
  }

  isMonthEmpty(month: Months): boolean {
    return this.orderMap.get(month)?.length === 0;
  }

  openOrderDetail(order: SimpleOrderInfoDTO): void {
    this._selectedOrder = order;
    this._isDetailActive = true;
    window.scroll(0, 0);
    this._cdr.detectChanges();
  }

  private mapOrdersByMonth(orders: SimpleOrderInfoDTO[]): void {
    orders.forEach((order) => {
      if (!order.line.cancelled && !order.line.completed) {
        this.activeOrders.push(order);
      } else {
        const month = new Date(order.line.deliveryDate).toLocaleString('tr-TR', { month: 'long' }) as Months;
        if (this.orderMap.get(month)?.length) {
          this.orderMap.set(month, [...this.orderMap.get(month), order]);
        } else {
          this.orderMap.set(month, [order]);
        }
      }
    });

    this._isOrdersEmpty = orders.length === 0;
    this._months = Array.from(this.orderMap.keys());
    this._loadingIndicatorService.stop();
    this._cdr.detectChanges();
  }

  private subscribeToOrderService(): void {
    this._orderService.fetchUserOrders(this.selectedFilterOption);
    this._orderService
      .getOrders()
      .pipe(
        tap(() => this.resetOrdersLists()),
        takeUntil(this.getDestroyInterceptor()),
        finalize(() => this._loadingIndicatorService.stop())
      )
      .subscribe((orders) => {
        this._isDetailActive = false;
        this.mapOrdersByMonth(orders);
      });
  }

  private resetOrdersLists(): void {
    this.orderMap.clear();
    this.activeOrders = [];
  }

  private subscribeToUserService(): void {
    this._userService.user$.subscribe((user) => {
      this._user = user;
    });
  }

  private sendGtmPageViewEvent(page): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Siparişlerim | Sanal Market',
      virtualPageName: page,
      objectId: '',
    });
  }

  private subscribeToAppStateService(): void {
    this._appStateService
      .getPortfolio$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((portfolio) => {
        this._portfolio = portfolio;
      });
  }
}
