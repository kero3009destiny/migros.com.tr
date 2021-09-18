import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { TimerModel } from '../../models';
import { NgxCountdownDirective } from '../../modules';

@Component({
  selector: 'fe-timer-bar',
  templateUrl: './timer-bar.component.html',
  styleUrls: ['./timer-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerBarComponent {
  disabled = true;
  @Input() tryAgainTimeout: number;
  @Output() tictoc = new EventEmitter();
  @Output() retry = new EventEmitter();

  @ViewChild('timer', { static: true }) timer: ElementRef;
  @ViewChild('loader', { static: true }) loader: ElementRef;
  @ViewChild(NgxCountdownDirective, { static: true }) countdown: NgxCountdownDirective;
  private _stepTimer = 0;

  get _completeTimer() {
    return (this.countdown?.ngxCountdownTimeout || 0) - this._stepTimer;
  }

  get loaderWidth() {
    const width = (this._completeTimer * 100) / (this.countdown?.ngxCountdownTimeout || 1);
    return `${width}%`;
  }

  get stepTime() {
    return `${this._completeTimer}sn`;
  }

  cdTicToc(event: TimerModel) {
    this._stepTimer = event.stepTimer || this._stepTimer;
    this.tictoc.emit(event);
    this.checkTryAgainDisableStatus();
  }

  checkTryAgainDisableStatus() {
    this.disabled = this._stepTimer < this.tryAgainTimeout;
  }

  play() {
    this.countdown.play();
  }

  reset() {
    this.countdown.reset();
  }

  pause() {
    this.countdown.pause();
  }

  onRetryClick() {
    this.disabled = true;
    this.retry.emit();
  }
}
