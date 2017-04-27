import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { RoomSelectionComponent } from './room-selection.component';
import { ConfigurationComponent } from './configuration.component';
import { RoomEditorComponent } from './room-editor.component';
import { AddBuildingComponent } from './add-building.component';
import { AddRoomComponent } from './add-room.component';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { APIService } from './api.service'

@NgModule({
  declarations: [
    AppComponent,
	RoomSelectionComponent,
	ConfigurationComponent,
	RoomEditorComponent,
	AddBuildingComponent,
	AddRoomComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
	HttpModule,
  	FlexLayoutModule,
	AppRoutingModule
  ],
  providers: [
	  APIService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
