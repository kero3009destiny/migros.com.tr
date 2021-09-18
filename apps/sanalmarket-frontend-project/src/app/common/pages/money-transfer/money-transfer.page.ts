import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GtmService } from '@fe-commerce/core';

import { faCalendarCheck, faHistory, faMapMarkerCheck, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'sm-money-transfer',
  templateUrl: './money-transfer.page.html',
  styleUrls: ['./money-transfer.page.scss'],
})
export class MoneyTransferPage implements OnInit {
  calendarIcon: IconDefinition = faCalendarCheck;
  markerIcon: IconDefinition = faMapMarkerCheck;
  historyIcon: IconDefinition = faHistory;

  constructor(private _gtmService: GtmService, private _router: Router) {}

  ngOnInit(): void {
    this.sendGtmPageViewEvent('MoneyTransfer');
  }

  sendGtmPageViewEvent(page: string): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Para Transferi | Migros Sanal Market',
      virtualPageName: page,
      objectId: '',
    });
  }
}
