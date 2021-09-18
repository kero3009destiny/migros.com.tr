import { Component, Input, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

import { LoggingService, UserService } from '@fe-commerce/core';
import { presenceAnimationFasterTrigger, SubscriptionAbstract } from '@fe-commerce/shared';

import { EMPTY } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';

import { faChevronDown, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import { CartInfoDTO, UserDTO } from '@migroscomtr/sanalmarket-angular';

import { ROUTE_CART } from '../../../../routes';

@Component({
  selector: 'sm-cart-dropdown',
  templateUrl: './cart-dropdown.component.html',
  styleUrls: ['./cart-dropdown.component.scss'],
  animations: [presenceAnimationFasterTrigger],
})
export class CartDropdownComponent extends SubscriptionAbstract implements OnInit {
  @Input() cartInfo: CartInfoDTO;

  private user: UserDTO;
  private opened = false;
  private authenticated = false;

  faChevronDown: IconDefinition = faChevronDown;

  constructor(private router: Router, private userService: UserService, private loggingService: LoggingService) {
    super();
  }

  ngOnInit() {
    this.subscribeToRouterNavigation();
    this.subscribeToUser();
    this.subscribeToIsAuthenticated();
  }

  getCartInfo(): CartInfoDTO {
    return this.cartInfo;
  }

  getRevenue(): number {
    return this.getCartInfo().revenue ? this.getCartInfo().revenue : 0;
  }

  isUserSignedIn(): boolean {
    return this.authenticated;
  }

  subscribeToUser(): void {
    this.userService.user$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((user) => {
      this.user = user;
    });
  }

  subscribeToIsAuthenticated(): void {
    this.userService.isAuthenticated$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((isAuthenticated) => {
      this.authenticated = isAuthenticated;
    });
  }

  subscribeToRouterNavigation() {
    this.router.events
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        filter((event) => event instanceof NavigationStart)
      )
      .subscribe(() => {
        this.opened = false;
      });
  }

  isOpened(): boolean {
    return this.opened;
  }

  isCartEmpty(): boolean {
    return this.getCartInfo()?.itemInfos?.length === 0;
  }

  openCartDropdown(): void {
    this.opened = !this.opened;
    if (this.router.url === `/${ROUTE_CART}`) {
      return;
    }
  }

  closeCartDropdown(): void {
    this.opened = false;
  }
}
