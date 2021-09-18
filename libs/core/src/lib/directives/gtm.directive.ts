import { AfterViewInit, Directive, ElementRef, HostListener, Input } from '@angular/core'
import { GtmDataModel } from '@fe-commerce/shared'
import { GtmService } from '../services'
import { LoggingService } from '../error/services'

@Directive({
  selector: '[feGtm]',
})
export class GtmDirective implements AfterViewInit {
  @Input() gtm: any
  private _intersectionObserver?: IntersectionObserver
  INTERSECTION_THRESHOLD = 0.5

  constructor(
    private _elementRef: ElementRef,
    private _gtmService: GtmService,
    private _loggingService: LoggingService
  ) {}

  ngAfterViewInit() {
    if (this._gtmService.isActive) {
      const impressionEvent = this.gtm.find((gtmEvent: GtmDataModel) => gtmEvent.name === 'impression')

      if (impressionEvent && impressionEvent.product) {
        this.initIntersectionObserver(impressionEvent)
      }
    }
  }

  initIntersectionObserver(impressionEvent) {
    this._intersectionObserver = new IntersectionObserver(
      entries => {
        this.checkForIntersection(entries, impressionEvent)
      },
      { threshold: this.INTERSECTION_THRESHOLD }
    )
    this._intersectionObserver.observe(<Element>this._elementRef.nativeElement)
  }

  checkForIntersection = (entries: Array<IntersectionObserverEntry>, impressionEvent) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if (this.checkIfIntersecting(entry)) {
        this._gtmService.getProductImpression(impressionEvent)
        this._intersectionObserver.unobserve(<Element>this._elementRef.nativeElement)
        this._intersectionObserver.disconnect()
      }
    })
  }

  checkIfIntersecting(entry: IntersectionObserverEntry) {
    return (<any>entry).isIntersecting && entry.target === this._elementRef.nativeElement
  }

  @HostListener('click', ['$event'])
  onClick() {
    // Prevent sending events if gtm not active
    if (!this._gtmService.isActive) {
      return
    }

    try {
      const clickEvent = this.gtm.find((gtmEvent: GtmDataModel) => gtmEvent.name === 'click')
      if (clickEvent && clickEvent.data) {
        this._gtmService.sendProductClickEvent(clickEvent.data)
      }
      const bannerClickEvent = this.gtm.find((gtmEvent: GtmDataModel) => gtmEvent.name === 'bannerClick')
      if (bannerClickEvent && bannerClickEvent.data) {
        this._gtmService.sendBannerEvent('promoClick', bannerClickEvent.data, bannerClickEvent.index)
      }
    } catch (error) {
      this._loggingService.logHttpError({ message: 'GTM error', title: '', error })
    }
  }
}
