import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { AppStateService } from '@fe-commerce/core';

import { faChevronRight, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

import { Step } from '../../models';

@Component({
  selector: 'fe-line-checkout-steps',
  templateUrl: './checkout-steps.component.html',
  styleUrls: ['./checkout-steps.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutStepsComponent {
  @Input() checkoutId: number;
  @Input() steps: Step[] = [];

  chevronRight: IconDefinition = faChevronRight;

  constructor(private _appStateService: AppStateService) {}

  getStep(step: Step): number {
    return step?.number;
  }

  getSteps(): Step[] {
    return this.steps;
  }

  getTitle(step: Step): string {
    return step?.title;
  }

  getUrl(step: Step): string {
    const portfolio = this._appStateService.isPortfolioElektronik()
      ? '/elektronik'
      : this._appStateService.isPortfolioKurban()
      ? '/kurban'
      : '';
    if (this.checkoutId) {
      return `${portfolio}/siparis/${step?.url}/${this.checkoutId}`;
    }
    return `${portfolio}/siparis/${step?.alternativeUrl}`;
  }
}
