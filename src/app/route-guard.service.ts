import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class RouteGuardService {

  constructor(private _router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    if (Cookie.get('authToken') === undefined || Cookie.get('authToken') === '' || Cookie.get('authToken') === null) {
      this._router.navigate(['/']);
      return false;
    } else {
      return true;
    }

  }
}
