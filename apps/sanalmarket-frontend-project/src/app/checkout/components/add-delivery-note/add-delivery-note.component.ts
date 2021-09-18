import { Component, EventEmitter, Output } from '@angular/core';

import { AppStateService, PortfolioEnum } from '@fe-commerce/core';

import { map } from 'rxjs/operators';

import { faEdit } from '@fortawesome/pro-solid-svg-icons';
import { Observable } from 'rxjs';

@Component({
  selector: 'sm-add-delivery-note',
  templateUrl: './add-delivery-note.component.html',
  styleUrls: ['./add-delivery-note.component.scss'],
})
export class AddDeliveryNoteComponent {
  @Output() deliveryNoteChange = new EventEmitter();
  editIcon = faEdit;

  constructor(private appStateService: AppStateService) {}

  onNoteChange(textAreaElement): void {
    this.deliveryNoteChange.emit(textAreaElement.value);
  }

  deliveryNoteAvailable(): Observable<boolean> {
    return this.appStateService
      .getPortfolio$()
      .pipe(map((portfolio) => this.doesPortfolioAllowDeliveryNote(portfolio)));
  }

  doesPortfolioAllowDeliveryNote(portfolio: PortfolioEnum): boolean {
    return portfolio !== PortfolioEnum.KURBAN;
  }
}
