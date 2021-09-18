import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { GtmService } from '../../services';

@Component({
  selector: 'fe-app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotFoundComponent implements OnInit {
  constructor(private gtmService: GtmService, private router: Router) {}

  ngOnInit(): void {
    this.gtmService.sendErrorEvent(404);
  }

  onClickButton(): void {
    this.router.navigateByUrl('/');
  }
}
