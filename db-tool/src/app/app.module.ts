import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule, MatDialogModule, MatExpansionModule, MatDividerModule, MatListModule, MatChipsModule, MatIconModule, MatAutocompleteModule, MatStepperModule, MatToolbarModule, MatGridListModule, MatTooltipModule, MatCardModule, MatCheckboxModule, MatSlideToggleModule, MatRadioModule, MatTableModule, MatMenuModule, MatSidenavModule } from '@angular/material';

import { AppComponent } from './app.component';
import { AppRouterModule } from './app-router.module';
import { ApiService } from './services/api.service'
import { Strings } from './services/strings.service'
import { HttpModule } from '@angular/http';
import { Defaults } from './services/defaults.service';
import { DndModule } from 'ng2-dnd';
import { HomeComponent } from './pages/home/home.component';
import { BuildingComponent } from './components/building/building.component';
import { BuildingModalComponent } from './modals/buildingmodal/buildingmodal.component';
import { RoomComponent } from './components/room/room.component';
import { RoomlistComponent } from './pages/roomlist/roomlist.component';
import { RoomModalComponent } from './modals/roommodal/roommodal.component';
import { RoomDetailComponent } from './pages/roomdetail/roomdetail.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BuildingComponent,
    BuildingModalComponent,
    RoomComponent,
    RoomlistComponent,
    RoomModalComponent,
    RoomDetailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRouterModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    HttpModule,
    MatDialogModule,
    MatExpansionModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatIconModule,
    MatToolbarModule,
    MatGridListModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatTableModule,
    MatMenuModule,
    DndModule.forRoot(),
    MatCardModule,
    MatSidenavModule
  ],
  entryComponents: [
    BuildingModalComponent,
    RoomModalComponent
  ],
  providers: [
    ApiService,
    Strings,
    Defaults
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
