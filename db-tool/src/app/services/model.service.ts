import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { Building, Room, Device, RoomConfiguration, DeviceType, Role, UIConfig, BuildingStatus, RoomStatus, Template } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  campusBuildingList: Building[] = Array<Building>();
  campusRoomList: Room[] = Array<Room>();
  campusDeviceList: Device[] = Array<Device>();
  campusUIConfigList: UIConfig[] = Array<UIConfig>();
  campusAlertsMap: Map<string, BuildingStatus> = new Map();

  buildingToRoomsMap: Map<string, Room[]> = new Map();
  roomToDevicesMap: Map<string, Device[]> = new Map();

  roomConfigurations: RoomConfiguration[] = Array<RoomConfiguration>();
  roomDesignations: string[] = Array<string>();

  deviceTypeList: DeviceType[] = Array<DeviceType>();
  deviceTypeMap: Map<string, DeviceType> = new Map();
  deviceRoles: Role[] = Array<Role>();

  buildingAlertsMap: Map<string, BuildingStatus> = new Map();
  roomAlertsMap: Map<string, RoomStatus> = new Map();

  iconList: string[] = Array<string>();
  templateList: Template[] = Array<Template>();

  currentUsername: string;
  currentUserPermissions: any;

  buildingsToAdd: Building[] = Array<Building>();
  buildingsToUpdate: Building[] = Array<Building>();
  buildingsToDelete: Building[] = Array<Building>();

  roomsToAdd: Room[] = Array<Room>();
  roomsToUpdate: Room[] = Array<Room>();
  roomsToDelete: Room[] = Array<Room>();

  devicesToAdd: Device[] = Array<Device>();
  devicesToUpdate: Device[] = Array<Device>();
  devicesToDelete: Device[] = Array<Device>();

  uiConfigsToAdd: UIConfig[] = Array<UIConfig>();
  uiConfigsToUpdate: UIConfig[] = Array<UIConfig>();
  uiConfigsToDelete: UIConfig[] = Array<UIConfig>();

  constructor(private api: APIService) {
    this.fillModel();
  }

  public async fillModel() {
    

    this.api.getUserPermissions().then((result) => {
      this.currentUserPermissions = result;
    });

    this.api.getAllBuildings().then((result) => {
      this.campusBuildingList = result;
    });

    this.api.getAllRooms().then((result) => {
      this.campusRoomList = result;
    });

    this.api.getAllDevices().then((result) => {
      this.campusDeviceList = result;
    });

    this.api.getAllUIConfigs().then((result) => {
      this.campusUIConfigList = result;
    });

    this.api.getAllAlerts().then((result) => {
      this.campusAlertsMap = result;
    });

    this.campusBuildingList.forEach(building => {
      this.api.getRoomsByBuilding(building.id).then((result) => {
        this.buildingToRoomsMap.set(building.id, result);
      });

      this.api.getAlertsByBuilding(building.id).then((result) => {
        this.buildingAlertsMap.set(building.id, result);
      });
    });

    this.campusRoomList.forEach(room => {
      this.api.getDevicesByRoom(room.id).then((result) => {
        this.roomToDevicesMap.set(room.id, result);
      });

      this.api.getAlertsByRoom(room.id).then((result) => {
        this.roomAlertsMap.set(room.id, result);
      });
    });

    this.api.getRoomConfigurations().then((result) => {
      this.roomConfigurations = result;
    });
    
    this.api.getRoomDesignations().then((result) => {
      this.roomDesignations = result as string[];
    });

    this.api.getDeviceTypes().then((result) => {
      this.deviceTypeList = result;

      this.deviceTypeList.forEach(type => {
        this.deviceTypeMap.set(type.id, type);
      });
    });

    this.api.getDeviceRoles().then((result) => {
      this.deviceRoles = result;
    });

    this.api.getIcons().then((result) => {
      this.iconList = result as string[];
    });

    this.api.getTemplates().then((result) => {
      this.templateList = result;
    });

    this.api.getCurrentUsername().then((result) => {
      this.currentUsername = result as string;
    });
  }

  public getFullBuildingList(): Building[] {
    return this.campusBuildingList;
  }
}
