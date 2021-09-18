import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GtmService } from '@fe-commerce/core';

@Component({
  selector: 'sm-money-point-and-coupon-page',
  templateUrl: './money-point-and-coupon-page.component.html',
  styleUrls: ['./money-point-and-coupon-page.component.scss'],
})
export class MoneyPointAndCouponPageComponent implements OnInit {
  constructor(private gtmService: GtmService, private router: Router) {}

  ngOnInit(): void {
    this.sendGtmPageViewEvent('MoneyPointAndCouponPage', 'Puan ve Çeklerim | Sanal Market');
  }

  private sendGtmPageViewEvent(pageComponentName: string, pageTitle: string): void {
    this.gtmService.sendPageView({
      event: `virtualPageview${pageComponentName}`,
      virtualPagePath: this.router.url,
      virtualPageTitle: pageTitle,
      virtualPageName: pageComponentName,
    });
  }
}
