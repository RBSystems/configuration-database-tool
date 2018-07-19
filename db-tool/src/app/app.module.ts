import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule, MatDialog, MatDialogModule, MatExpansionModule, MatDividerModule, MatListModule, MatChipsModule, MatIconModule, MatAutocompleteModule, MatStepperModule, MatToolbarModule, MatGridListModule, MatTooltipModule, MatCardModule, MatCheckboxModule } from '@angular/material';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { WalkthroughComponent } from './walkthrough/walkthrough.component';
import { BuildingComponent } from './building/building.component';
import { AppRouterModule } from './app-router.module';
import { ApiService } from './api.service'
import { Strings } from './strings.service'
import { HttpModule } from '@angular/http';
import { RoomComponent } from './room/room.component';
import { DeviceComponent } from './device/device.component';
import { ModalComponent } from './modal/modal.component';
import { UIConfigComponent } from './uiconfig/uiconfig.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WalkthroughComponent,
    BuildingComponent,
    RoomComponent,
    DeviceComponent,
    UIConfigComponent,
    ModalComponent
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
    MatCheckboxModule
  ],
  providers: [
    ApiService,
    Strings
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
