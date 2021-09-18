import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { catchError, switchMap, takeUntil } from 'rxjs/operators';

import { AnonymousTrackOrderModalComponent } from '../../components/anonymous-track-order-modal/anonymous-track-order-modal.component';
import { OrderService } from '../order.service';
import { Subscription, throwError } from 'rxjs';
import { SubscriptionAbstract } from '@fe-commerce/shared';

@Injectable({
  providedIn: 'root',
})
export class TrackOrderService extends SubscriptionAbstract {
  private id: number;
  private phoneNumber: string;
  protected _subscription = new Subscription();

  constructor(private _orderService: OrderService, private _dialog: MatDialog, private router: Router) {
    super();
  }

  openTrackOrderModal(): void {
    this._dialog
      .open(AnonymousTrackOrderModalComponent, {
        panelClass: ['wide-dialog', 'mobile-modal'],
        id: 'track-order-dialog',
      })
      .afterClosed()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => throwError(error)),
        switchMap((orderInfo) => {
          this.id = parseInt(orderInfo.id);
          this.phoneNumber = orderInfo.phoneNumber;
          return this._orderService.getAnonymousOrder(this.id, this.phoneNumber);
        })
      )
      .subscribe((data) => {
        this.router.navigate(['/siparis-takibi'], {
          state: { order: data },
          queryParams: { id: this.id, p: this.phoneNumber },
        });
      });
  }
}
