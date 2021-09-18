import { AfterViewInit, Directive, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core'

@Directive({
  selector: 'img[feLazyLoad]',
})
export class LazyLoadImageDirective implements OnDestroy, AfterViewInit {
  @HostBinding('attr.src') srcAttr =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAKCAYAAABrGwT5AAAAF0lEQVR42mN89uzxfwYyAeOo5lHNhAAA7jIk17T4Y6wAAAAASUVORK5CYII='
  @Input() src: string
  observer: IntersectionObserver
  constructor(private _elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.canLazyLoad() ? this.lazyLoadImage() : this.loadImage()
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.unobserve(this._elementRef.nativeElement)
    }
  }

  private canLazyLoad() {
    return window && 'IntersectionObserver' in window
  }

  private lazyLoadImage() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          this.loadImage()
          this.observer.unobserve(this._elementRef.nativeElement)
        }
      })
    })
    this.observer.observe(this._elementRef.nativeElement)
  }

  private loadImage() {
    this._elementRef.nativeElement.src = this.src
  }
}
