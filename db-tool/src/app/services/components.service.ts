import { Injectable } from '@angular/core';
import { RoomBuilderComponent } from '../components/roombuilder/roombuilder.component';
import { RoomStateComponent } from '../components/roomstate/roomstate.component';
import { DeviceComponent } from '../components/device/device.component';
import { CompItem } from '../components/smee.component';
import { DeviceListComponent } from '../components/devicelist/devicelist.component';

@Injectable({
  providedIn: 'root'
})
export class ComponentsService {

  constructor() { }

  ComponentMap = {
    "Room Builder": RoomBuilderComponent,
    "Room State": RoomStateComponent,
    "device": DeviceComponent,
    "deviceList": DeviceListComponent
  }

  getCompItem(action: string, data: any) {
    return new CompItem(this.ComponentMap[action], data);
  }
}