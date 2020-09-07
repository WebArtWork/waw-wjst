import { NgModule } from '@angular/core';
import { CommonModule } from '@common';
import { ProfileComponent } from './profile.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
	path: '',
	component: ProfileComponent
}];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule
	],
	declarations: [
		ProfileComponent
	],
	providers: []
	
})

export class ProfileModule { }
