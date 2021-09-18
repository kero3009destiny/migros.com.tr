import { Component } from '@angular/core';

import { faTimes } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-masterpass-confirm-dialog',
  templateUrl: './masterpass-confirm-dialog.component.html',
  styleUrls: ['./masterpass-confirm-dialog.component.scss'],
})
export class MasterpassConfirmDialogComponent {
  faTimes = faTimes;
}
