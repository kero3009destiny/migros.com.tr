import { Component, EventEmitter, Inject, Output, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';
import { MatRadioChange } from '@angular/material/radio';

import { BagType } from '@fe-commerce/line-checkout';

import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { CheckoutBagInfoDTO } from '@migroscomtr/sanalmarket-angular';

interface BagSelectorModalData {
  initialBagType: BagType;
  /**
   * quantity -> poset sayisi
   * price -> tekil poset ucreti
   * amount -> toplam poset ucreti (quantity * price)
   * orderedAmountWithBag -> posetle beraber siparis toplam ucreti (edited)
   *                         PREVENT USAGE OF THIS FIELD as price to be paid calculations
   *                         should consider variable effects on revenue separately
   */
  checkoutBagInfo: CheckoutBagInfoDTO;
}

@Component({
  selector: 'sm-bag-selector-modal',
  templateUrl: './bag-selector-modal.component.html',
  styleUrls: ['./bag-selector-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BagSelectorModalComponent {
  BagType = BagType;
  closeIcon = faTimes;

  @Output() closeEvent = new EventEmitter<void>();
  @Output() bagTypeSelected = new EventEmitter<BagType>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: BagSelectorModalData) {}

  onBagSelectionChanged($event: MatRadioChange): void {
    this.bagTypeSelected.emit($event.value);
  }

  onClickCloseBtn(): void {
    this.closeEvent.emit();
  }

  isPlasticBagSelected(): boolean {
    return BagType.PLASTIC_BAG === this.data.initialBagType;
  }

  isClothBagSelected(): boolean {
    return BagType.CLOTH_BAG === this.data.initialBagType;
  }

  getBagTypeUnitPrice(bagType: BagType): number {
    return this.data.checkoutBagInfo?.[bagType]?.price;
  }
}
