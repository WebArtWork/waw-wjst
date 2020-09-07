import { NgModule } from '@angular/core';
import { CommonModule } from '@common';
import { UsersComponent } from './users.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
	path: '',
	component: UsersComponent
}];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule
	],
	declarations: [
		UsersComponent
	],
	providers: []
	
})

export class UsersModule { }
