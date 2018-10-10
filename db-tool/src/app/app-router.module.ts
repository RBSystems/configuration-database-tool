import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RoomlistComponent } from './pages/roomlist/roomlist.component';
import { RoomDetailComponent } from './pages/roomdetail/roomdetail.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent},
  { path: 'roomlist/:buildingID', component: RoomlistComponent},
  { path: 'roomdetail/:roomID', component: RoomDetailComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRouterModule {}
