import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';

@Injectable()
export class Admins implements CanActivate {
	constructor(private router: Router) {}
	canActivate(){
		if ( localStorage.getItem('waw_user') ) {
			let user = JSON.parse(localStorage.getItem('waw_user'));
			if(user.is && user.is.admin) return true;
			this.router.navigate(['/profile']);
			return false;
		} else {
			this.router.navigate(['/login']);
			return false;
		}
	}
}

@Injectable()
export class Authenticated implements CanActivate {
	constructor(private router: Router) {}
	canActivate(){
		if ( localStorage.getItem('waw_user') ) {
			return true;
		} else {
			return this.router.navigate(['/login']);
		}
	}

}

@Injectable()
export class Guest implements CanActivate {
	constructor(private router: Router) {}
	canActivate(){
		if (localStorage.getItem('waw_user')) {
			return this.router.navigate(['/'])
		} else {
			return true;
		}
	}
}