import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { MatRadioChange } from '@angular/material/radio';

import { InstantDiscountService } from '@fe-commerce/campaign-instant-discount';
import {
  Card,
  MasterpassListCardsComponent,
  MasterpassService,
  MasterpassStateService,
} from '@fe-commerce/line-payment-masterpass';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTrashAlt } from '@fortawesome/pro-regular-svg-icons/faTrashAlt';

import { MasterpassConfirmDialogComponent } from './masterpass-confirm-dialog/masterpass-confirm-dialog.component';

@Component({
  selector: 'sm-masterpass-card-list',
  templateUrl: './masterpass-list-cards.component.html',
  styleUrls: ['./masterpass-list-cards.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SmMasterpassListCardsComponent extends MasterpassListCardsComponent implements OnInit {
  private _trashIcon: IconProp = faTrashAlt;

  constructor(
    _masterpassService: MasterpassService,
    _instantDiscountService: InstantDiscountService,
    _changeDetectorRef: ChangeDetectorRef,
    _masterpassStateService: MasterpassStateService,
    private dialog: MatDialog
  ) {
    super(_masterpassService, _instantDiscountService, _changeDetectorRef, _masterpassStateService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  getTrashIcon(): IconProp {
    return this._trashIcon;
  }

  onSelected($event: MatRadioChange): void {
    // TODO find out why other events interfere to this callback
    if ($event instanceof MatRadioChange) {
      super.onCardSelected($event.value);
    }
  }

  onRemoveCard(cardName: string): void {
    const dialogRef = this.dialog.open(MasterpassConfirmDialogComponent, {
      panelClass: 'small-dialog',
    });

    dialogRef.afterClosed().subscribe((userPermission) => {
      userPermission && super.onRemoveCard(cardName);
    });
  }

  isCardSelected(card: Card): boolean {
    return card.Value1 === this.selectedCard;
  }
}
