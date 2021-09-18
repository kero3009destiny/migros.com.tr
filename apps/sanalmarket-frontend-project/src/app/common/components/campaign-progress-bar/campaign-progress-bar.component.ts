import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CampaignProgressModel } from '@fe-commerce/shared';

@Component({
  selector: 'sm-campaign-progress-bar',
  templateUrl: './campaign-progress-bar.component.html',
  styleUrls: ['./campaign-progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignProgressBarComponent implements OnInit {
  @Input() progress: CampaignProgressModel;
  @Output() setProgressBarAvailable = new EventEmitter();

  ngOnInit(): void {
    this.setProgressBarAvailable.emit();
  }

  isProgressVisible(): boolean {
    return !!this.progress;
  }

  isFrequencyType(): boolean {
    return this.progress.type === 'FREQUENCY';
  }

  isSumType(): boolean {
    return this.progress.type === 'SUM';
  }

  isProgressInitial(): boolean {
    return this.progress.current === '0';
  }

  isProgressCompleted(): boolean {
    return this.progress.current >= this.progress.target;
  }

  getCurrent(): string {
    return this.progress.current;
  }

  getTarget(): string {
    return this.progress.target;
  }

  getCompletedPercentage(current: string, target: string): string {
    const currentValue = parseInt(current, 10);
    const targetValue = parseInt(target, 10);
    if (currentValue >= targetValue) {
      return '100%';
    }
    const width = (currentValue / targetValue) * 100;
    return `${width}%`;
  }
}
