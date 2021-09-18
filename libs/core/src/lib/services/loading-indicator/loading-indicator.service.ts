import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Injectable({
  providedIn: 'root',
})
export class LoadingIndicatorService {
  private spinnerTopRef = this.cdkSpinnerCreate();
  private spin$: Subject<boolean> = new Subject();

  // When multiple processes want to start loading service,
  // we want to show only one spinner, it allows us to track those processes
  private processes = [];
  private processId = 0;

  constructor(private overlay: Overlay) {
    this.spin$.asObservable().subscribe((response) => {
      const isSpinnerAttached = this.spinnerTopRef.hasAttached();
      if (response && !isSpinnerAttached) {
        this.showSpinner();
        return;
      }
      if (!response && isSpinnerAttached) {
        this.stopSpinner();
      }
    });
  }

  private cdkSpinnerCreate() {
    return this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });
  }

  private showSpinner() {
    this.spinnerTopRef.attach(new ComponentPortal(SpinnerComponent));
  }

  private stopSpinner() {
    this.spinnerTopRef.detach();
  }

  start() {
    this.processes.push(`process-${this.processId++}`);
    this.spin$.next(true);
  }

  stop() {
    this.processes.pop();
    --this.processId;
    if (this.processes?.length < 1) {
      this.spin$.next(false);
    }
  }
}
