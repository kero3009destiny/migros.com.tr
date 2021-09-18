import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fe-spinner',
  // this image source must be same under all apps
  template: ` <img src="assets/icons/loading-indicator.gif" /> `,
  styleUrls: ['spinner.component.scss'],
})
export class SpinnerComponent {}
