import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material-experimental/mdc-dialog';

import { AppStateService, PortfolioEnum, UserService } from '@fe-commerce/core';
import { DeliveryZoneService } from '@fe-commerce/delivery';
import { EnvService } from '@fe-commerce/env-service';
import { ServiceAreaObjectType, SubscriptionAbstract } from '@fe-commerce/shared';

import { takeUntil } from 'rxjs/operators';

import { faArrowLeft, faTimes } from '@fortawesome/pro-regular-svg-icons';
import { UserDTO } from '@migroscomtr/sanalmarket-angular';
import { Observable } from 'rxjs';

enum Phase {
  OPTIONS,
  ADDRESS,
  STORE,
  FOUNDATION,
}

@Component({
  selector: 'sm-delivery-options-modal',
  templateUrl: './delivery-options-modal.component.html',
  styleUrls: ['./delivery-options-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeliveryOptionsModalComponent extends SubscriptionAbstract implements OnInit {
  Phase = Phase;

  closeIcon = faTimes;
  returnIcon = faArrowLeft;

  private _phase = Phase.OPTIONS;
  private readonly _titleMap = {
    [Phase.OPTIONS]: 'Teslimat Yöntemini Belirle',
    [Phase.ADDRESS]: 'Adresime Gelsin',
    [Phase.STORE]: 'Mağazadan Alacağım',
    [Phase.FOUNDATION]: 'Bağış Yapacağım',
  };
  private readonly _portfolioOptionsMap = {
    [PortfolioEnum.MARKET]: {
      [Phase.ADDRESS]: true,
      [Phase.STORE]: true,
      [Phase.FOUNDATION]: true,
    },
    [PortfolioEnum.ELECTRONIC]: {
      [Phase.ADDRESS]: true,
      [Phase.STORE]: false,
      [Phase.FOUNDATION]: false,
    },
    // TODO: Will be changed according to backend implementation.
    [PortfolioEnum.HEMEN]: {
      [Phase.ADDRESS]: true,
      [Phase.STORE]: false,
      [Phase.FOUNDATION]: false,
    },
  };
  private _portfolio: PortfolioEnum;

  constructor(
    public dialogRef: MatDialogRef<DeliveryOptionsModalComponent>,
    private _deliveryZoneService: DeliveryZoneService,
    private _userService: UserService,
    private _envService: EnvService,
    private _appStateService: AppStateService
  ) {
    super();
  }

  ngOnInit(): void {
    this._appStateService
      .getPortfolio$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((portfolio) => {
        this._portfolio = portfolio;
      });
  }

  getUser$(): Observable<UserDTO> {
    return this._userService.user$;
  }

  getPhase(): Phase {
    return this._phase;
  }

  getTitle(): string {
    return this._titleMap[this._phase];
  }

  onClickAddressSelected(): void {
    this._phase = Phase.ADDRESS;
  }

  onClickStoreSelected(): void {
    this._phase = Phase.STORE;
  }

  onClickFoundationSelected(): void {
    this._phase = Phase.FOUNDATION;
  }

  onClickReturned(): void {
    this._phase = Phase.OPTIONS;
  }

  onClickClosed(): void {
    this.dialogRef.close();
  }

  isFoundationEnabled(): boolean {
    return this._envService.isFoundationEnabled;
  }

  isPhaseAvailable(phase: Phase): boolean {
    return this._portfolioOptionsMap[this._portfolio][phase];
  }

  onDeliveryZoneChanged({ districtId, type }: { districtId: number; type: ServiceAreaObjectType }): void {
    this._deliveryZoneService
      .changeDeliveryZoneDialog({
        serviceAreaObjectId: districtId,
        type,
      })
      .subscribe(() => {
        this.dialogRef.close();
      });
  }
}
