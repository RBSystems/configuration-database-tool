import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { RoomSelectionComponent } from './room-selection.component';

@NgModule({
  declarations: [
    AppComponent,
	RoomSelectionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
	HttpModule,
  	FlexLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
