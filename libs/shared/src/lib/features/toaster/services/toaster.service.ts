import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ToasterComponent } from '../components/toaster.component';
import { ToasterConfigModel, ToasterDataModel, ToasterSettingsModel, ToasterStateType } from '../models/ToasterModel';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  constructor(private snackBar: MatSnackBar, private zone: NgZone) {}

  settings: ToasterSettingsModel = {
    state: 'success',
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  };

  data: ToasterDataModel = {
    title: null,
    message: null,
    icon: false,
    violations: null,
  };

  initialToasterConfig = { settings: this.settings, data: this.data };

  showToaster(config: ToasterConfigModel = this.initialToasterConfig) {
    const panelClass = config.settings.state ? `mat-snack-bar-container-${config.settings.state}` : '';
    const icon = config.settings.state ? config.settings.state : config.data.icon || this.data.icon;

    config.settings.panelClass = panelClass;
    config.data.icon = icon as ToasterStateType;

    /**
     * Workaround for CartService onDeleteMultipleItems method's toaster
     * https://stackoverflow.com/questions/53277691/angular-material-snackbar-not-shown-correctly
     */
    this.zone.run(() => {
      this.snackBar.openFromComponent(ToasterComponent, {
        ...this.settings,
        ...config.settings,
        data: {
          ...this.data,
          ...config.data,
        },
      });
    });
  }
}
