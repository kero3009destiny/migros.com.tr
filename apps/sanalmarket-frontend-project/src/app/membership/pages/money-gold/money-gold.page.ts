import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { GtmService } from '@fe-commerce/core';

import { faMinus, faPlus } from '@fortawesome/pro-regular-svg-icons';

import { DESCRIPTIONS, ADVANTAGES, FAQS } from './constants';

@Component({
  selector: 'sm-money-gold',
  templateUrl: './money-gold.page.html',
  styleUrls: ['./money-gold.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MoneyGoldPage implements OnInit {
  step: number;
  baseImagePath = 'assets/images/money-gold/';

  faqs = FAQS;
  descriptions = DESCRIPTIONS;
  advantages = ADVANTAGES;

  plusIcon = faPlus;
  minusIcon = faMinus;

  constructor(private _gtmService: GtmService, private _router: Router) {}

  ngOnInit(): void {
    this.sendGtmPageViewEvent('MoneyGold');
  }

  isExpanded(index: number): boolean {
    return index === this.step;
  }

  setStep(index: number): void {
    this.step = index;
  }

  onClosed(index: number): void {
    if (index === this.step) {
      this.step = null;
    }
  }

  sendGtmPageViewEvent(page: string): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Money Gold | Macrocenter',
      virtualPageName: page,
      objectId: '',
    });
  }
}
