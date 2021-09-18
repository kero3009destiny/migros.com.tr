import { Component } from '@angular/core';

class Store {
  storeName: string;
  storePhoneNumber: string;
}

@Component({
  selector: 'sm-alo-migros',
  templateUrl: './alo-migros.page.html',
  styleUrls: ['./alo-migros.page.scss'],
})
export class AloMigrosPage {
  storeInfo: Store;

  setStoreInfo(store) {
    this.storeInfo = store;
  }
}
