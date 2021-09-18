import { Injectable } from '@angular/core';

import { BannerPlaceholderModel } from '@fe-commerce/shared';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BannerResponseDTO, BannerRestControllerService, ServiceResponse } from '@migroscomtr/sanalmarket-angular';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  constructor(private _bannerRestService: BannerRestControllerService) {}

  getBannersByPlaceholder(placeholder: BannerPlaceholderModel): Observable<BannerResponseDTO[]> {
    return this._bannerRestService.getBannersByPlaceholder({ placeholder }).pipe(map((response) => response.data));
  }

  onClickBanner(bannerId, eventId): void {
    this._bannerRestService
      .onClickBanner({ bannerId, eventId })
      .pipe(map((response: ServiceResponse) => response.data))
      .subscribe();
  }
}
