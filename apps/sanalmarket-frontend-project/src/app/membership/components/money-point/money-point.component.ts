import { Component, OnInit } from '@angular/core';

import { LoggingService, UserService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { EMPTY } from 'rxjs';
import { catchError, mergeMap, takeUntil } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faUserTag } from '@fortawesome/pro-light-svg-icons';

@Component({
  selector: 'sm-money-point',
  templateUrl: './money-point.component.html',
  styleUrls: ['./money-point.component.scss'],
})
export class MoneyPointComponent extends SubscriptionAbstract implements OnInit {
  constructor(private userService: UserService, private _loggingService: LoggingService) {
    super();
  }

  private isMoneyUser: boolean;
  private userMoneyPoints: number;
  private customerBond: number;
  private personnelBond: number;
  private userTagIcon = faUserTag;

  ngOnInit(): void {
    this.userService.user$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        })
      )
      .subscribe((user) => {
        this.isMoneyUser = user.crmStatus === 'VERIFIED';
      });
    this.userService
      .getUserPoints()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        })
      )
      .subscribe((userPoints) => {
        this.userMoneyPoints = userPoints?.['MONEY_POINT']?.value;
        this.customerBond = userPoints?.['CUSTOMER_BOND']?.value;
        this.personnelBond = userPoints?.['PERSONNEL_BOND']?.value;
      });
  }

  getUserMoneyPoints(): number {
    return this.userMoneyPoints ?? 0;
  }

  getCustomerBond(): number {
    return this.customerBond ?? 0;
  }

  getPersonnelBond(): number {
    return this.personnelBond ?? 0;
  }

  getIsMoneyUser(): boolean {
    return this.isMoneyUser;
  }

  getUserTagIcon(): IconProp {
    return this.userTagIcon;
  }
}
