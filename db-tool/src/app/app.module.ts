import { NgModule } from "@angular/core";
import { APP_BASE_HREF } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import {
  MatSidenavModule,
  MatButtonModule,
  MatToolbarModule,
  MatCardModule,
  MatDividerModule,
  MatListModule,
  MatExpansionModule,
  MatIconModule,
  MatProgressBarModule,
  MatMenuModule,
  MatTabsModule,
  MatFormFieldModule,
  MatInputModule
} from "@angular/material";
import "hammerjs";

import { AppComponent } from './components/app/app.component';
import { APIService } from './services/api.service';
import { SocketService } from './services/socket.service';
import { ModelService } from './services/model.service';
import { StringsService } from './services/strings.service';
import { BuildingListComponent } from './components/buildinglist/buildinglist.component';
import { BuildingComponent } from './components/building/building.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: "",
    redirectTo: "app",
    pathMatch: "full"
  },
  {
    path: 'home',
    component: BuildingListComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    BuildingListComponent,
    BuildingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    HttpClientModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  providers: [
    {
      // set the base route for the router
      provide: APP_BASE_HREF,
      useValue: "/"
    },
    APIService,
    SocketService,
    ModelService,
    StringsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
