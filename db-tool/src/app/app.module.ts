import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule, MatDialog, MatDialogModule, MatExpansionModule, MatDividerModule, MatListModule, MatChipsModule, MatIconModule, MatAutocompleteModule, MatStepperModule, MatToolbarModule, MatGridListModule, MatTooltipModule, MatCardModule, MatCheckboxModule, MatSlideToggleModule, MatRadioModule, MatTableModule, MatMenuModule } from '@angular/material';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { WalkthroughComponent } from './walkthrough/walkthrough.component';
import { BuildingComponent } from './building/building.component';
import { AppRouterModule } from './app-router.module';
import { ApiService } from './services/api.service'
import { Strings } from './services/strings.service'
import { HttpModule } from '@angular/http';
import { RoomComponent } from './room/room.component';
import { DeviceComponent } from './device/device.component';
import { ModalComponent } from './modal/modal.component';
import { UIConfigComponent } from './uiconfig/uiconfig.component';
import { PanelComponent } from './panel/panel.component';
import { SummaryComponent } from './summary/summary.component';
import { Defaults } from './services/defaults.service';
import { DndComponent } from './dnd/dnd.component';
import { DndModule } from 'ng2-dnd';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WalkthroughComponent,
    BuildingComponent,
    RoomComponent,
    DeviceComponent,
    UIConfigComponent,
    PanelComponent,
    SummaryComponent,
    ModalComponent,
    DndComponent
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
    MatCardModule
  ],
  providers: [
    ApiService,
    Strings,
    Defaults
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
