import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { faInfoCircle, IconDefinition } from '@fortawesome/pro-regular-svg-icons';

import {
  CostModel,
  COSTS,
  MoneyTransferStepsModel,
  StoreModel,
  STORE_STEPS,
  WEB_STEPS,
  WITHDRAW_STEPS,
} from '../money-transfer';

@Component({
  selector: 'sm-money-transfer-tabs',
  templateUrl: './money-transfer-tabs.component.html',
  styleUrls: ['./money-transfer-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MoneyTransferTabsComponent implements OnInit {
  private storeSteps: MoneyTransferStepsModel[];
  private webSteps: MoneyTransferStepsModel[];
  private withdrawSteps: MoneyTransferStepsModel[];
  private costs: CostModel[];
  private moneyTransferResults: StoreModel[] = [];
  private moneyTransferMessage: string;
  private currentTabIndex: number;
  infoWarningIcon: IconDefinition = faInfoCircle;
  displayedStoreColumns = ['storeName', 'phoneNumber', 'address'];
  displayedCostColumns = ['minSendLimit', 'maxSendLimit', 'cost'];

  ngOnInit(): void {
    this.setDatas();
  }

  getMoneyTransferResults(): StoreModel[] {
    return this.moneyTransferResults;
  }

  getStoreSteps(): MoneyTransferStepsModel[] {
    return this.storeSteps;
  }

  getWebSteps(): MoneyTransferStepsModel[] {
    return this.webSteps;
  }

  getWithdrawSteps(): MoneyTransferStepsModel[] {
    return this.withdrawSteps;
  }

  getCurrentTabIndex(): number {
    return this.currentTabIndex;
  }

  getMoneyTransferMessage(): string {
    return this.moneyTransferMessage;
  }

  getCosts(): CostModel[] {
    return this.costs;
  }

  setMoneyTransferStores(stores: StoreModel[]): void {
    this.moneyTransferResults = stores;
    this.moneyTransferMessage = '';
  }

  setCurrentTabIndex(index: number): void {
    this.currentTabIndex = index;
  }

  setMoneyTransferMessage(message: string): void {
    this.moneyTransferResults = [];
    this.moneyTransferMessage = message;
  }

  setDatas(): void {
    this.storeSteps = STORE_STEPS;
    this.webSteps = WEB_STEPS;
    this.withdrawSteps = WITHDRAW_STEPS;
    this.costs = COSTS;
  }

  isMoneyTransferResult(): boolean {
    return this.getMoneyTransferResults().length > 0 && this.getCurrentTabIndex() === 4;
  }

  isMoneyTransferMessage(): boolean {
    return Boolean(this.moneyTransferMessage) && this.getCurrentTabIndex() === 4;
  }
}
