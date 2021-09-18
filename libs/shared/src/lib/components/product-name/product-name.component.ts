import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fe-product-name',
  templateUrl: './product-name.component.html',
  styleUrls: ['./product-name.component.scss'],
})
export class ProductNameComponent {
  @Input() skipLocationChange: boolean;
  @Input() productName: string;
  @Input() productId: number;
  @Input() prettyName: string;
  @Input() customClass: string;
  @Input() asLink = true;
  @Output() gtmClick = new EventEmitter<string>();
  @Input() referrerEventId: string;
  @Input() queryParams = {};

  sendGtmClick(): void {
    this.gtmClick.emit();
  }
}
