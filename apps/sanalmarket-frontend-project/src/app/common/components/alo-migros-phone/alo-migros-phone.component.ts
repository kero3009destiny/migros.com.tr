import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { GtmService } from '@fe-commerce/core';

import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { faPhoneAlt } from '@fortawesome/pro-solid-svg-icons';

class Store {
  storeName: string;
  storePhoneNumber: string;
}

@Component({
  selector: 'sm-alo-migros-phone',
  templateUrl: './alo-migros-phone.component.html',
  styleUrls: ['./alo-migros-phone.component.scss'],
})
export class AloMigrosPhoneComponent implements OnInit {
  @Input() storeInfo: Store;

  phoneIcon = faPhoneAlt;
  closeIcon = faTimes;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { storeName: string; storePhoneNumber: string; storeAddress: string },
    private _dialogRef: MatDialogRef<AloMigrosPhoneComponent>,
    private _gtmService: GtmService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.sendGtmPageViewEvent('AloMigros');
  }

  sendGtmPageViewEvent(page: string): void {
    this._gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: 'Alo Migros | Migros Sanal Market',
      virtualPageName: page,
      objectId: '',
    });
  }

  closeModal(): void {
    this._dialogRef.close();
  }
}
