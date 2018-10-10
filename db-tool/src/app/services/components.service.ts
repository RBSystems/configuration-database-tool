import { Injectable } from '@angular/core';
import { RoomBuilderComponent } from '../components/roombuilder/roombuilder.component';
import { RoomStateComponent } from '../components/roomstate/roomstate.component';
import { DeviceComponent } from '../components/device/device.component';
import { CompItem } from '../components/smee.component';

@Injectable({
  providedIn: 'root'
})
export class ComponentsService {

  constructor() { }

  ComponentMap = {
    "Room Builder": RoomBuilderComponent,
    "Room State": RoomStateComponent,
    "ELK": RoomStateComponent,
    "device": DeviceComponent
  }

  getCompItem(action: string, data: any) {
    return new CompItem(this.ComponentMap[action], data);
  }
}
