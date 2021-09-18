import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material-experimental/mdc-dialog';

import { DialogComponent } from '../../components';
import { DialogConfigModel, DialogDataModel, DialogSettingsModel, DialogStateType } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  dialogRef: MatDialogRef<any>;

  settings: DialogSettingsModel = {
    panelClass: ['modal', 'modal--default'],
    width: '560px',
    state: 'success',
    modalClass: '',
  };

  data: DialogDataModel = {
    title: 'Title',
    message: 'Message',
    confirmMessage: 'Evet',
    cancelMessage: 'İptal',
    showCancelButton: true,
    // tslint:disable-next-line:no-empty
    onDialogClose: () => {},
    icon: false,
  };

  initialDialogConfig = { settings: this.settings, data: this.data };

  constructor(public dialog: MatDialog) {}

  generatePanelClass(settings) {
    const panelClassArray = [];
    if (settings.state) {
      panelClassArray.push('modal', `modal--${settings.state}`);
    }

    if (settings.modalClass) {
      panelClassArray.push(settings.modalClass);
    }
    return panelClassArray;
  }

  generateDialogConfig(config: DialogConfigModel = this.initialDialogConfig): MatDialogConfig {
    const panelClass = config.settings.state ? this.generatePanelClass(config.settings) : this.settings.panelClass;

    const icon = config.settings.state ? config.settings.state : config.data.icon || this.data.icon;

    config.settings.panelClass = panelClass;
    config.data.icon = icon as DialogStateType;

    return {
      ...this.settings,
      ...config.settings,
      data: {
        ...this.data,
        ...config.data,
        state: config.settings.state,
      },
    };
  }

  openDialog(config?: DialogConfigModel) {
    const settings = this.generateDialogConfig(config);

    this.dialogRef = this.dialog.open(DialogComponent, settings);

    this.dialogRef.afterClosed().subscribe((result) => {
      settings.data.onDialogClose(result || {});
    });
  }
}
