import { OnInit, Directive, Output, Input, EventEmitter } from '@angular/core'
import { BehaviorSubject, Observable, interval, defer, Subscription } from 'rxjs'
import { withLatestFrom, filter, take, map, share, reduce } from 'rxjs/operators'
import { TimerModel, TimerStateType } from '../../models'

@Directive({
  selector: '[feNgxCountdown]',
})
export class NgxCountdownDirective implements OnInit {
  stepTimer$: Observable<any>
  stepTimerSubscription: Subscription
  completeTimerSubscription: Subscription
  completeTimer$: Observable<any>
  stepTimer = 0
  completeTimer: number

  _currentState: TimerStateType = 'PENDING'
  private _pause = new BehaviorSubject<boolean>(true)

  @Input() ngxCountdownTimeout = 300

  @Output() cdTicToc = new EventEmitter<TimerModel>()

  ngOnInit() {
    this._init()
  }

  getPausableTimer(
    timeout: number,
    pause: BehaviorSubject<boolean>
  ): { stepTimer: Observable<any>; completeTimer: Observable<any> } {
    const pausableTimer$ = defer(() => {
      let seconds = 1
      return interval(1000).pipe(
        withLatestFrom(pause),
        filter(([_v, paused]) => !paused),
        take(timeout),
        map(() => seconds++)
      )
    }).pipe(share())

    return { stepTimer: pausableTimer$, completeTimer: pausableTimer$.pipe(reduce((_x, y) => y)) }
  }

  private _init() {
    const { stepTimer, completeTimer } = this.getPausableTimer(this.ngxCountdownTimeout, this._pause)

    this.stepTimerSubscription = stepTimer.subscribe(timer => {
      this.stepTimer = timer
      this.cdTicToc.emit({
        state: this._currentState,
        stepTimer: this.stepTimer,
      })
    })

    this.completeTimerSubscription = completeTimer.subscribe(timer => {
      this.completeTimer = timer
      this._currentState = 'COMPLETED'
      this.cdTicToc.emit({
        state: this._currentState,
        completeTimer: this.completeTimer,
      })
    })

    this.cdTicToc.emit({
      state: this._currentState,
      stepTimer: this.stepTimer,
    })
  }

  play() {
    this._currentState = 'PLAYING' as TimerStateType
    this._pause.next(false)
  }

  pause() {
    this._currentState = 'PAUSED' as TimerStateType
    this._pause.next(true)
    this.cdTicToc.emit({
      state: this._currentState,
      stepTimer: this.stepTimer,
    })
  }

  reset() {
    this._currentState = 'PENDING'
    this._pause.next(true)
    this.completeTimerSubscription.unsubscribe()
    this.stepTimerSubscription.unsubscribe()
    this.stepTimer = 0
    this.completeTimer = this.ngxCountdownTimeout
    this._init()
  }
}
