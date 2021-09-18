import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TimerBarComponent } from '@fe-commerce/shared';

@Component({
  selector: 'sm-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerComponent extends TimerBarComponent {
  constructor() {
    super();
  }

  get stepTime() {
    const minutes = Math.floor(this._completeTimer / 60);
    const seconds = this._completeTimer % 60;
    return `${minutes < 10 ? '0' + minutes : minutes} : ${seconds < 10 ? '0' + seconds : seconds}`;
  }
}
