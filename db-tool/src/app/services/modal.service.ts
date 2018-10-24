import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Building, Room, Device, DeviceType } from '../objects';
import { UIInfo, PresetModalComponent } from '../modals/presetmodal/presetmodal.component';
import { BuildingModalComponent } from '../modals/buildingmodal/buildingmodal.component';
import { RoomModalComponent } from '../modals/roommodal/roommodal.component';
import { IconModalComponent } from '../modals/iconmodal/iconmodal.component';
import { DeviceModalComponent } from '../modals/devicemodal/devicemodal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private dialog: MatDialog) { }

  OpenBuildingModal(building: Building) {
    this.dialog.open(BuildingModalComponent, { data: building });
  }

  OpenRoomModal(room: Room, roomExists?: boolean) {
    this.dialog.open(RoomModalComponent, { data: { room: room, roomExists: roomExists} });
  }

  OpenDeviceModal(device: Device, devices: Device[], map: Map<string, DeviceType>, list: DeviceType[], deviceExists?: boolean) {
    this.dialog.open(DeviceModalComponent, { data: { device: device, deviceExists: deviceExists, devicesInRoom: devices, deviceTypeList: list, deviceTypeMap: map} });
  }

  OpenPresetModal(uiInfo: UIInfo) {
    this.dialog.open(PresetModalComponent, { data: uiInfo });
  }

  OpenIconModal(): string {
    let iconRef = this.dialog.open(IconModalComponent);

    let result: string;
    iconRef.afterClosed().subscribe(val => {
      result = val;
    });

    return result;
  }
}
