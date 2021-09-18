import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AppStateService, PortfolioEnum } from '@fe-commerce/core';

@Component({
  selector: 'sm-delivery-choice',
  templateUrl: './delivery-choice.component.html',
  styleUrls: ['./delivery-choice.component.scss'],
})
export class DeliveryChoiceComponent {
  @Input() ringOption: boolean;
  @Input() contactlessOption: boolean;
  @Output() changeRing: EventEmitter<boolean> = new EventEmitter();
  @Output() changeContactless: EventEmitter<boolean> = new EventEmitter();

  constructor(private appStateService: AppStateService) {}

  onChangeRingChoice(event): void {
    this.changeRing.emit(!event.checked);
  }

  onChangeContactless(event): void {
    this.changeContactless.emit(event.checked);
  }

  isDeliveryChoicesAvailable(): boolean {
    return this.appStateService.getPortfolio() !== PortfolioEnum.KURBAN;
  }
}
