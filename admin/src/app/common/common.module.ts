import { NgModule } from '@angular/core';
import { CommonModule as Common } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WacomModule } from 'wacom';
@NgModule({
	declarations: [],
	exports: [/* filters */
		FormsModule,
		WacomModule,
		Common
	],
	imports: [
		FormsModule,
		WacomModule,
		Common
	]
})
export class CommonModule { }
