import { AfterContentChecked, Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'fe-read-more',
  templateUrl: './read-more.component.html',
  styleUrls: ['./read-more.component.scss'],
})
export class ReadMoreComponent implements AfterContentChecked {
  @Input() maxHeight = 160;
  @Input() label = 'Devamını Oku';

  private _isCollapsed = false;
  private _toggleClicked = false;

  constructor(private _elementRef: ElementRef) {}

  ngAfterContentChecked() {
    if (this._toggleClicked) {
      return;
    }

    const currentHeight = this._elementRef.nativeElement.getElementsByTagName('div')[0].offsetHeight;

    if (currentHeight > this.maxHeight) {
      this._isCollapsed = true;
    }
  }

  isCollapsed(): boolean {
    return this._isCollapsed;
  }

  onClickToggle() {
    this._isCollapsed = false;
    this._toggleClicked = true;
  }
}
