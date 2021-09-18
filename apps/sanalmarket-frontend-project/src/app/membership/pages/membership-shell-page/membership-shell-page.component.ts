import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { AppStateService } from '@fe-commerce/core';

import { filter } from 'rxjs/operators';

import { ROUTE_MEMBERSHIP } from '../../../routes';

@Component({
  selector: 'sm-membership-shell-page',
  templateUrl: './membership-shell-page.component.html',
  styleUrls: ['./membership-shell-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MembershipShellPageComponent implements OnInit {
  private readonly MEMBERSHIP_CHILD_ROUTE_REGEX = new RegExp(ROUTE_MEMBERSHIP + '/' + '\\w');
  private currentUrl: string;

  constructor(private router: Router, private appState: AppStateService) {
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.currentUrl = e.url;
    });
  }

  ngOnInit(): void {
    this.appState.setMobileBottomNavVisibility(true);
  }

  isMembershipChildRoute(): boolean {
    return this.currentUrl ? !!this.MEMBERSHIP_CHILD_ROUTE_REGEX.exec(this.currentUrl) : false;
  }
}
