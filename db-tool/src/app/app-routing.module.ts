import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoomSelectionComponent } from './room-selection.component';
import { ConfigurationComponent } from './configuration.component';
import { RoomEditorComponent } from './room-editor.component';
import { AddBuildingComponent } from './add-building.component';
import { AddRoomComponent } from './add-room.component';
import { AddDeviceComponent } from './add-device.component';

const routes: Routes = [
  { path: '', redirectTo: '/room-selection', pathMatch: 'full' },
  { path: 'room-selection', component: RoomSelectionComponent },
  { path: 'config', component: ConfigurationComponent },
  { path: 'room-editor', component: RoomEditorComponent },
  { path: 'add-building', component: AddBuildingComponent },
  { path: 'add-room', component: AddRoomComponent },
  { path: 'add-device', component: AddDeviceComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
