import { NgModule } from '@angular/core';
import { CommonModule } from '@common';
import { LoginComponent } from './login.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
	path: '',
	component: LoginComponent
}];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule
	],
	declarations: [
		LoginComponent
	],
	providers: []
	
})

export class LoginModule { }
