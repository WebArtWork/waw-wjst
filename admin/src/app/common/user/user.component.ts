import { Component } from '@angular/core';
import { UserService } from '@services';
@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})
export class UserComponent {
	constructor(public us: UserService){}
}
