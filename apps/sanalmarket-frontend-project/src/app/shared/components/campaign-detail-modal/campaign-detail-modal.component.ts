import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material-experimental/mdc-dialog';

import { faTimes } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'sm-campaign-detail-modal',
  templateUrl: './campaign-detail-modal.component.html',
  styleUrls: ['./campaign-detail-modal.component.scss'],
})
export class CampaignDetailModalComponent implements OnInit {
  // ICONS
  closeIcon = faTimes;

  // DATA
  private detail = '';
  private imageUrl = '';
  private title = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data, private dialogRef: MatDialogRef<CampaignDetailModalComponent>) {}

  getImageUrl(): string {
    return this.imageUrl;
  }

  getDetail(): string {
    return this.detail;
  }

  getTitle(): string {
    return this.title;
  }

  onClickClose(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.detail = this.data.detail;
    this.imageUrl = this.data.imageUrl;
    this.title = this.data.title;
  }
}
