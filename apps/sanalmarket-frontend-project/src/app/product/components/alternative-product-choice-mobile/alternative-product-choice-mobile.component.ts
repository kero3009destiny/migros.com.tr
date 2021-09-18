import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { filter } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faRepeatAlt } from '@fortawesome/pro-regular-svg-icons/faRepeatAlt';
import { CheckoutDTO } from '@migroscomtr/sanalmarket-angular';

import { AlternativeProductChoiceDialogComponent } from '../alternative-product-choice-dialog/alternative-product-choice-dialog.component';
import { CART_CHOICES } from '../alternative-product-choice/alternative-product-choice.component';

@Component({
  selector: 'sm-alternative-product-choice-mobile',
  templateUrl: './alternative-product-choice-mobile.component.html',
  styleUrls: ['./alternative-product-choice-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlternativeProductChoiceMobileComponent {
  @Input() choice: CheckoutDTO.AlternativeProductChoiceEnum;
  @Output() alternativeProductChoice = new EventEmitter<CheckoutDTO.AlternativeProductChoiceEnum>();

  private _repeatIcon = faRepeatAlt;

  constructor(private matDialog: MatDialog, private _cd: ChangeDetectorRef) {}

  getRepeatIcon(): IconProp {
    return this._repeatIcon;
  }

  getChoiceLabel(): string {
    return CART_CHOICES.find((cartChoice) => cartChoice.value === this.choice)?.description;
  }

  openAlternativeProductChoiceModal(): void {
    const dialogRef = this.matDialog.open(AlternativeProductChoiceDialogComponent, {
      panelClass: 'wide-dialog',
      data: this.choice,
    });

    dialogRef
      .afterClosed()
      .pipe(filter((choice) => !!choice))
      .subscribe((choice: CheckoutDTO.AlternativeProductChoiceEnum) => {
        this.choice = choice;
        this.alternativeProductChoice.emit(choice);
        this._cd.detectChanges();
      });
  }
}
