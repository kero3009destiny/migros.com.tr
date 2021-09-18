import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppStateService } from '@fe-commerce/core';

@Component({
  selector: 'sm-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {
  constructor(private appState: AppStateService) {}

  ngOnInit(): void {
    this.appState.setFooterLite(true);
  }

  ngOnDestroy(): void {
    this.appState.setFooterLite(false);
  }
}
