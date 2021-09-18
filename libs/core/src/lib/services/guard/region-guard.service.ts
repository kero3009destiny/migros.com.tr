import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class RegionGuard implements CanActivate {
  constructor(private _router: Router, private _userService: UserService) {}

  canActivate(): Observable<boolean> {
    return this._userService.hasDistrictId$.pipe(
      take(1),
      map((hasDistrict: boolean) => {
        if (!hasDistrict) {
          this._router.navigate(['/teslimat-yontemi']);
          return false;
        }
        return true;
      })
    );
  }
}
