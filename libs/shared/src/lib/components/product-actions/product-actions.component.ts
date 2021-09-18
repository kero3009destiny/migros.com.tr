import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { buffer, debounceTime, takeUntil, tap } from 'rxjs/operators';

import { Subject } from 'rxjs';

import { ProductUnitModel } from '../../models';
import { SubscriptionAbstractDirective } from '../subscription-abstract/subscription.abstract';

@Component({
  selector: 'fe-product-actions',
  templateUrl: './product-actions.component.html',
  styleUrls: ['./product-actions.component.scss'],
})
export class ProductActionsComponent extends SubscriptionAbstractDirective implements OnInit, OnChanges {
  localAmount = 0;

  private DEBOUNCE_TIME = 300;
  private localAmount$: Subject<number> = new Subject();
  @Input() reminded: boolean;
  @Input() amount: number;
  @Input() maxAmount: number;
  @Input() status: string;
  @Input() buttonClass = 'button-primary';
  @Input() incrementAmount = 1;
  @Input() initialIncrementAmount = 1;
  @Input() noPointerEventOnDecreaseToZero = false;
  @Input() reminderVisibility = true;
  @Output() updated = new EventEmitter<number>();
  @Output() remind = new EventEmitter();
  @Output() maxAmountReached = new EventEmitter();
  @Input() unit: ProductUnitModel = 'PIECE';

  ngOnInit() {
    this.subscribeToLocalAmount();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.amount) {
      this.localAmount = changes.amount.currentValue;
    }
  }

  get noCartOperations(): boolean {
    return this.status !== 'IN_SALE';
  }

  private handleMaxAmountError() {
    this.maxAmountReached.emit({ amount: this.maxAmount, unit: this.unit });
  }

  get inCart() {
    return this.localAmount > 0;
  }

  subscribeToLocalAmount() {
    this.localAmount = this.amount;

    this.localAmount$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        tap((amount) => {
          this.localAmount = amount;
        }),
        buffer(this.localAmount$.pipe(debounceTime(this.DEBOUNCE_TIME)))
      )
      .subscribe((amount) => {
        this.updated.emit(amount[amount.length - 1]);
      });
  }

  add() {
    this.emitUpdatedValue(this.initialIncrementAmount);
  }

  rollback() {
    this.localAmount = this.amount;
  }

  increase() {
    if (this.localAmount < this.maxAmount) {
      const localAmount = this.localAmount + this.incrementAmount;
      this.emitUpdatedValue(localAmount);
    } else {
      this.handleMaxAmountError();
    }
  }

  decrease() {
    if (this.localAmount > 0) {
      const localAmount = this.localAmount - this.incrementAmount;
      this.emitUpdatedValue(localAmount);
    }
  }

  remindWhenInSaleProduct() {
    this.remind.emit();
  }

  emitUpdatedValue(localAmount: number) {
    this.localAmount$.next(localAmount);
  }

  get shownLocalAmount() {
    return this.unit === 'GRAM' ? this.localAmount / 1000 : this.localAmount;
  }
}
