import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import {
  faChevronDoubleLeft,
  faChevronDoubleRight,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'sm-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  toFirstPageIcon = faChevronDoubleLeft;
  toPrevPageIcon = faChevronLeft;
  toNextPageIcon = faChevronRight;
  toLastPageIcon = faChevronDoubleRight;

  private _shownPageIndexes: number[] = [];

  private _pageIndex: number;
  get pageIndex(): number {
    return this._pageIndex;
  }
  @Input() set pageIndex(value: number) {
    this._pageIndex = value;
    this._shownPageIndexes = this._calculatePageIndexes();
  }

  private _totalPageCount: number;
  get totalPageCount(): number {
    return this._totalPageCount;
  }
  @Input() set totalPageCount(value: number) {
    this._totalPageCount = value;
    this._shownPageIndexes = this._calculatePageIndexes();
  }

  @Output() pageChanged = new EventEmitter<number>();

  getPageRowColor(index: number): ThemePalette {
    return index === this._pageIndex ? 'primary' : 'accent';
  }

  getShownPageIndexes(): number[] {
    return this._shownPageIndexes;
  }

  onPageChanged(page: number): void {
    this.pageChanged.emit(page);
  }

  private _calculatePageIndexes(): number[] {
    const arr = [this._pageIndex - 1, this._pageIndex, this._pageIndex + 1]
      .filter((index) => index > 0)
      .filter((index) => index <= this._totalPageCount);
    for (let index = arr[0] - 1; arr.length < 3 && index > 0; index--) {
      arr.push(index);
    }
    for (let index = arr[arr.length - 1] + 1; arr.length < 3 && index <= this._totalPageCount; index++) {
      arr.push(index);
    }
    arr.sort((a, b) => a - b);
    return arr;
  }
}
