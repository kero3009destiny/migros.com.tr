import { AfterViewInit, Directive, ElementRef, EventEmitter, Output } from '@angular/core'

@Directive({
  selector: '[feDeferLoad]',
})
export class DeferLoadDirective implements AfterViewInit {
  @Output() public insideViewPort: EventEmitter<any> = new EventEmitter()
  @Output() public outsideViewPort: EventEmitter<any> = new EventEmitter()
  prevRatio = 0

  private _intersectionObserver?: IntersectionObserver

  constructor(private _element: ElementRef) {}

  ngAfterViewInit() {
    this._intersectionObserver = new IntersectionObserver(
      entries => {
        this.checkForIntersection(entries)
      },
      { threshold: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] }
    )
    this._intersectionObserver.observe(<Element>this._element.nativeElement)
  }

  checkForIntersection = (entries: Array<IntersectionObserverEntry>) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      const visiblePct = Math.floor(entry.intersectionRatio * 100)
      if (visiblePct >= 50 && this.prevRatio < 50) {
        // element is in viewport if it's visibility >50%
        this.insideViewPort.emit()
      }

      if (visiblePct <= 50 && this.prevRatio >= 50) {
        // element is out of viewport if it's visibility <50%
        this.outsideViewPort.emit()
      }
      this.prevRatio = visiblePct
    })
  }
}
