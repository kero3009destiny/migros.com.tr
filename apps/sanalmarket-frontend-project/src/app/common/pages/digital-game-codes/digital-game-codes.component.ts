import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { GtmService } from '@fe-commerce/core';

interface EPin {
  name: string;
  title: string;
  value_price: {
    value: string;
    price: number;
  }[];
}
@Component({
  selector: 'sm-digital-game-codes',
  templateUrl: './digital-game-codes.component.html',
  styleUrls: ['./digital-game-codes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DigitalGameCodesComponent implements OnInit {
  constructor(private _gtmService: GtmService, private _router: Router) {}

  ngOnInit(): void {
    this.sendGtmPageViewEvent('DigitalGameCodes');
  }

  sendGtmPageViewEvent(page: string): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Dijital Oyun Kodları | Migros Sanal Market',
      virtualPageName: page,
      objectId: '',
    });
  }

  getEPins(): EPin[] {
    return [
      {
        name: 'steam',
        title: 'Steam Cüzdan Kodu',
        value_price: [
          { value: 'Steam Cüzdan Kodu', price: 10 },
          { value: 'Steam Cüzdan Kodu', price: 20 },
          { value: 'Steam Cüzdan Kodu', price: 50 },
          { value: 'Steam Cüzdan Kodu', price: 100 },
        ],
      },
      {
        name: 'zula',
        title: 'Zula - Zula Altını',
        value_price: [
          { value: '3000 Zula Altını', price: 7 },
          { value: '5850 Zula Altını', price: 13 },
          { value: '16250 Zula Altını', price: 35 },
          { value: '34000 Zula Altını', price: 70 },
          { value: '70000 Zula Altını', price: 140 },
          { value: '150000 Zula Altını', price: 270 },
        ],
      },
      {
        name: 'lol',
        title: 'League Of Legends - RP',
        value_price: [
          { value: 'LOL - 400 RP', price: 16 },
          { value: 'LOL - 840 RP', price: 32 },
          { value: 'LOL - 1780 RP', price: 64 },
          { value: 'LOL - 3620 RP', price: 125 },
          { value: 'LOL - 6450 RP', price: 216 },
        ],
      },
      {
        name: 'razer',
        title: 'Razer Gold - TL',
        value_price: [
          { value: '5 TL Razer Gold Pin', price: 5 },
          { value: '10 TL Razer Gold Pin', price: 10 },
          { value: '25 TL Razer Gold Pin', price: 25 },
          { value: '50 TL Razer Gold Pin', price: 50 },
          { value: '100 TL Razer Gold Pin', price: 100 },
        ],
      },
      {
        name: 'point-blank',
        title: 'Point Blank - TG',
        value_price: [
          { value: '900 TG', price: 5 },
          { value: '1800 TG', price: 10 },
          { value: '4500 TG', price: 25 },
          { value: '10000 TG', price: 55 },
          { value: '20000 TG', price: 110 },
        ],
      },
      {
        name: 'valorant',
        title: 'Valorant VP',
        value_price: [
          { value: 'Valorant 300 VP', price: 16 },
          { value: 'Valorant 600 VP', price: 32 },
          { value: 'Valorant 1250 VP', price: 64 },
          { value: 'Valorant 2500 VP', price: 125 },
          { value: 'Valorant 4400 VP', price: 216 },
        ],
      },
      {
        name: 'pubg-mobile',
        title: 'PubG Mobile UC',
        value_price: [
          { value: '33 PubG Mobile UC', price: 5 },
          { value: '70 PubG Mobile UC', price: 10 },
          { value: '180 PubG Mobile UC', price: 25 },
          { value: '360 PubG Mobile UC', price: 50 },
          { value: '765 PubG Mobile UC', price: 100 },
        ],
      },
    ];
  }
}
