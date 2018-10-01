import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuildingComponent } from './building/building.component';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { DeviceComponent } from './device/device.component';
import { ModalComponent } from './modal/modal.component';
import { WalkthroughComponent } from './walkthrough/walkthrough.component';
import { UIConfigComponent } from './uiconfig/uiconfig.component';
import { SummaryComponent } from './summary/summary.component';
import { DndComponent } from './dnd/dnd.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'walkthrough', component: WalkthroughComponent },
  { path: 'building', component: BuildingComponent },
  { path: 'room', component: RoomComponent },
  { path: 'device', component: DeviceComponent },
  { path: 'uiconfig', component: UIConfigComponent },
  { path: 'summary', component: SummaryComponent },
  { path: 'modal', component: ModalComponent},
  { path: 'dnd', component: DndComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRouterModule {}
