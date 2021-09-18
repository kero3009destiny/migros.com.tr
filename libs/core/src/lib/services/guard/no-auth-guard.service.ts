import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { UserService } from '../user/user.service'
import { Observable } from 'rxjs'
import { take, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private _router: Router, private _userService: UserService) {}

  canActivate(): Observable<boolean> {
    // i.e. if isAuthenticated is false, then set canActivate to true
    return this._userService.isAuthenticated$.pipe(
      take(1),
      map((isLoggedIn: boolean) => {
        if (isLoggedIn) {
          this._router.navigate(['/'])
          return false
        }
        return true
      })
    )
  }
}
