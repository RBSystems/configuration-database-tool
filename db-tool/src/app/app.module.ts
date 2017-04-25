import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { RoomSelectionComponent } from './room-selection.component';
import { ConfigurationComponent } from './configuration.component';
import { APIService } from './api.service'

@NgModule({
  declarations: [
    AppComponent,
	RoomSelectionComponent,
	ConfigurationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
	HttpModule,
  	FlexLayoutModule,
	RouterModule.forRoot([
		{
			path: '',
			redirectTo: '/room-selection',
			pathMatch: 'full'
		},
		{
			path: 'room-selection',
			component: RoomSelectionComponent
		},
		{
			path: 'config',
			component: ConfigurationComponent
		}
	])
  ],
  providers: [
	  APIService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
