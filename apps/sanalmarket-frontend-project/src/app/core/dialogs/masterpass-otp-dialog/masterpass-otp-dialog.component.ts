import { AfterViewInit, Component } from '@angular/core';

import { MasterpassOtpModalComponent } from '@fe-commerce/line-payment-masterpass';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes, faTimesCircle } from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'sm-masterpass-dialog',
  templateUrl: './masterpass-otp-dialog.component.html',
  styleUrls: ['./masterpass-otp-dialog.component.scss'],
})
export class SmMasterpassOtpDialogComponent extends MasterpassOtpModalComponent implements AfterViewInit {
  private _faTimes = faTimes;
  private _clearIcon = faTimesCircle;

  getClearIcon(): IconProp {
    return this._clearIcon;
  }

  getTimesIcon(): IconProp {
    return this._faTimes;
  }

  clearInputField(field: string): void {
    this.verifyFormGroup.get(field).setValue(null);
  }
}
