import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { AppStateService, PortfolioEnum } from '@fe-commerce/core';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons/faCheckCircle';
import { faCircle } from '@fortawesome/pro-regular-svg-icons/faCircle';
import { OrderDTO } from '@migroscomtr/sanalmarket-angular';

import ScheduleTypeEnum = OrderDTO.ScheduleTypeEnum;
import CollectionStatusEnum = OrderDTO.CollectionStatusEnum;
import DeliveryModelEnum = OrderDTO.DeliveryModelEnum;

export interface StatusBarViewModel {
  stepNumber: number;
  status: CollectionStatusEnum[];
  label: string;
}

export const STATUS_BAR_STEPS_LAST_MILE: StatusBarViewModel[] = [
  {
    stepNumber: 1,
    status: [CollectionStatusEnum.NewPending, CollectionStatusEnum.InPool],
    label: 'Sipariş Alındı',
  },
  {
    stepNumber: 2,
    status: [
      CollectionStatusEnum.Collecting,
      CollectionStatusEnum.CollectingPaused,
      CollectionStatusEnum.Collected,
      CollectionStatusEnum.CollectionApproved,
      CollectionStatusEnum.Invoiced,
      CollectionStatusEnum.AssignedForDelivery,
      CollectionStatusEnum.ReadyForDelivery,
    ],
    label: 'Hazırlanıyor',
  },
  {
    stepNumber: 3,
    status: [CollectionStatusEnum.InDelivery],
    label: 'Teslimata Çıkarıldı',
  },
];

export const STATUS_BAR_STEPS_KURBAN: StatusBarViewModel[] = [
  {
    stepNumber: 1,
    status: [
      CollectionStatusEnum.NewPending,
      CollectionStatusEnum.InPool,
      CollectionStatusEnum.Collecting,
      CollectionStatusEnum.CollectingPaused,
      CollectionStatusEnum.Collected,
      CollectionStatusEnum.CollectionApproved,
      CollectionStatusEnum.Invoiced,
      CollectionStatusEnum.AssignedForDelivery,
      CollectionStatusEnum.ReadyForDelivery,
    ],
    label: 'Sipariş Alındı',
  },
  {
    stepNumber: 2,
    status: [CollectionStatusEnum.InDelivery],
    label: 'Teslimatta',
  },
];

export const STATUS_BAR_STEPS_SHIPMENT: StatusBarViewModel[] = [
  {
    stepNumber: 1,
    status: [CollectionStatusEnum.NewPending, CollectionStatusEnum.InPool],
    label: 'Sipariş Alındı',
  },
  {
    stepNumber: 2,
    status: [CollectionStatusEnum.InDelivery],
    label: 'Kargoya Verildi',
  },
];

@Component({
  selector: 'sm-order-status-bar',
  templateUrl: './order-status-bar.component.html',
  styleUrls: ['./order-status-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusBarComponent {
  @Input() deliveryAddressObjectType: string;
  @Input() deliveryModel: DeliveryModelEnum;
  @Input() isCancelled: boolean;
  @Input() status: CollectionStatusEnum;

  private _checkIcon = faCheckCircle;
  private _circleIcon = faCircle;
  private _portfolio: PortfolioEnum;

  constructor(private _appStateService: AppStateService) {}

  isPortfolioKurban(): boolean {
    this._portfolio = this._appStateService.getPortfolio();
    return this._portfolio === PortfolioEnum.KURBAN;
  }

  getSteps(): StatusBarViewModel[] {
    return this.deliveryModel === ScheduleTypeEnum.Shipment
      ? STATUS_BAR_STEPS_SHIPMENT
      : this.isPortfolioKurban()
      ? STATUS_BAR_STEPS_KURBAN
      : STATUS_BAR_STEPS_LAST_MILE;
  }

  getIcon(step): IconProp {
    return step.status.includes(this.status) || this.isPreviousStep(step) ? this._checkIcon : this._circleIcon;
  }

  isDelivered(): boolean {
    return this.status === CollectionStatusEnum.Delivered;
  }

  isOrderCompleted(): boolean {
    return this.isCancelled || this.isDelivered();
  }

  isPreviousStep(step: StatusBarViewModel): boolean {
    if (this.isPortfolioKurban()) {
      const currentStep = STATUS_BAR_STEPS_KURBAN.find((statusBarStep) => statusBarStep.status.includes(this.status));
      return currentStep && step.stepNumber < currentStep.stepNumber;
    } else {
      const currentStep = STATUS_BAR_STEPS_LAST_MILE.find((statusBarStep) =>
        statusBarStep.status.includes(this.status)
      );
      return currentStep && step.stepNumber < currentStep.stepNumber;
    }
  }

  isActive(step: StatusBarViewModel): boolean {
    if (this.isPortfolioKurban()) {
      const currentStep = STATUS_BAR_STEPS_KURBAN.find((statusBarStep) => statusBarStep.status.includes(this.status));
      return currentStep && step.stepNumber === currentStep.stepNumber;
    } else {
      const currentStep = STATUS_BAR_STEPS_LAST_MILE.find((statusBarStep) =>
        statusBarStep.status.includes(this.status)
      );
      return currentStep && step.stepNumber === currentStep.stepNumber;
    }
  }

  getDeliveredLabel(): string {
    return this.deliveryModel === ScheduleTypeEnum.Shipment
      ? 'Kargo Teslim Edildi'
      : this.deliveryAddressObjectType === 'USER'
      ? 'Adrese Teslim Edildi'
      : this.deliveryAddressObjectType === 'FOUNDATION'
      ? 'Bağış Kurumuna Teslim Edildi'
      : 'Mağazadan Teslim Edildi';
  }

  getStatusLabel(): string {
    if (this.isPortfolioKurban()) {
      return STATUS_BAR_STEPS_KURBAN.find((statusBarStep) => statusBarStep.status.includes(this.status)).label;
    } else {
      return STATUS_BAR_STEPS_LAST_MILE.find((statusBarStep) => statusBarStep.status.includes(this.status)).label;
    }
  }

  isStepperVisible(): boolean {
    return this.deliveryAddressObjectType !== 'FOUNDATION';
  }

  isLastStep(step: StatusBarViewModel): boolean {
    return step.stepNumber === this.getSteps().length;
  }
}
