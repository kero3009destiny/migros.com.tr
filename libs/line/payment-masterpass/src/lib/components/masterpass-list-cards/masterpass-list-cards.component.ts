import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { InstantDiscountService } from '@fe-commerce/campaign-instant-discount';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { Observable } from 'rxjs';

import { Card, UserStatus } from '../../models';
import { MasterpassService, MasterpassStateService } from '../../services';
import { extractInputsFromNodeList } from '../../utils';

@Component({
  selector: 'fe-masterpass-list-cards',
  templateUrl: './masterpass-list-cards.component.html',
  styleUrls: ['./masterpass-list-cards.component.scss'],
})
export class MasterpassListCardsComponent extends SubscriptionAbstract implements OnInit, AfterViewInit {
  selectedCard = 'NONE';
  isUserUpdateNeeded$ = this._masterpassService.getStatus().pipe(map((status) => status === UserStatus.UPDATE_NEEDED));

  @ViewChild('removeCardForm') removeCardForm: ElementRef<HTMLFormElement>;
  @ViewChild('updateUserForm') updateUserForm: ElementRef<HTMLFormElement>;
  @Input() checkoutId: number;

  constructor(
    protected _masterpassService: MasterpassService,
    private _instantDiscountService: InstantDiscountService,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _masterpassStateService: MasterpassStateService
  ) {
    super();
  }

  ngOnInit(): void {
    this._subscribeToInstantDiscounts();
    // When the cards array is empty, it should revert to the #guest template, but it does not
    // So we have to check explicitly
    this._subscribeToCards();
  }

  ngAfterViewInit(): void {
    this._updateUserInputs();
  }

  getCards(): Observable<Card[]> {
    return this._masterpassService.getCards();
  }

  onCardSelected(card: Card): void {
    this.selectedCard = card?.Value1 || 'NONE';
    this._masterpassService.updateSelectedCard(card);
    if (this.selectedCard === 'NONE') {
      this.onRemoveInstantDiscount();
    }
  }

  onRemoveCard(cardName: string): void {
    const removeInputs = extractInputsFromNodeList(this.removeCardForm);
    removeInputs.find((el) => el.name === 'accountAliasName').value = cardName;
    this._masterpassService.removeCard(removeInputs);
  }

  onRemoveInstantDiscount(): void {
    this._instantDiscountService.cancel();
  }

  private _updateUserInputs(): void {
    const updateUserInputs = extractInputsFromNodeList(this.updateUserForm);
    this._masterpassService.updateUser(updateUserInputs);
  }

  private _subscribeToInstantDiscounts(): void {
    this.getCards()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),

        filter((cards) => cards.length > 0),
        map((cards) => cards.map((card) => card.Value1))
      )
      .subscribe((cardNumbers) => {
        this._instantDiscountService.fetchInstantDiscounts(this.checkoutId, cardNumbers, 'MASTERPASS');
      });
  }

  private _subscribeToCards(): void {
    this._masterpassService
      .getCards()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        distinctUntilChanged((prev, curr) => prev.length === curr.length)
      )
      .subscribe(() => {
        this.selectedCard = 'NONE';
        this._instantDiscountService.cancel();
        this._changeDetectorRef.markForCheck();
      });
  }

  onLinkAccepted(): void {
    this._masterpassStateService.setStatus(UserStatus.UPDATE_APPROVED);
  }
}
