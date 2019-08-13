import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { MatDialog } from '@angular/material';

import 'rxjs/add/operator/map';
import { Building, Room, RoomConfiguration, Device, DeviceType, Template, BulkUpdateResponse, UIConfig, Role } from './objects';

@Injectable()
export class ApiService {
  // url: string = "http://localhost:9999";
  // url: string = '';
  options: RequestOptions;
  headers: Headers;
  constructor(private http: Http, public dialog: MatDialog) {
    this.headers = new Headers(
      {'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'}
    );

    this.options = new RequestOptions({headers : this.headers}); 
  }

  ///// BUILDING FUNCTIONS /////
  GetBuildingList(): Observable<Building[]> {
    return this.http.get("buildings", this.options).map(response => response.json());
  }

  AddBuilding(toAdd: Building): Observable<any> {
    return this.http.post("buildings/" + toAdd._id, toAdd, this.options).map(response => response.json());
  }

  UpdateBuilding(IDToEdit: string, toEdit: Building): Observable<any> {
    return this.http.put("buildings/" + IDToEdit + "/update", toEdit, this.options).map(response => response.json());
  }


  ///// ROOM FUNCTIONS /////
  GetRoomList(building: string): Observable<Room[]> {
    return this.http.get("buildings/" + building + "/rooms", this.options).map(response => response.json());
  }

  GetRoomByID(roomID: string): Observable<Room> {
    return this.http.get("rooms/" + roomID, this.options).map(response => response.json());
  }

  AddRoom(toAdd: Room): Observable<any> {
    return this.http.post("rooms/" + toAdd._id + "/add", toAdd, this.options).map(response => response.json());
  }

  UpdateRoom(IDToEdit: string, toEdit: Room): Observable<any> {
    return this.http.put("rooms/" + IDToEdit + "/update", toEdit, this.options).map(response => response.json());
  }

  GetRoomConfigurations(): Observable<RoomConfiguration[]> {
    return this.http.get("roomconfigurations", this.options).map(response => response.json());
  }

  GetAllRooms(): Observable<Room[]> {
    return this.http.get("rooms", this.options).map(response => response.json());
  }


  ///// DEVICE FUNCTIONS /////
  AddDevice(toAdd: Device): Observable<any> {
    return this.http.post("devices/" + toAdd._id + "/add", toAdd, this.options).map(response => response.json());
  }

  UpdateDevice(IDToEdit: string, toEdit: Device): Observable<any> {
    return this.http.put("devices/" + IDToEdit + "/update", toEdit, this.options).map(response => response.json());
  }

  GetDeviceList(room: string): Observable<Device[]> {
    return this.http.get("rooms/" + room + "/devices", this.options).map(response => response.json());
  }

  GetDeviceTypesList(): Observable<DeviceType[]> {
    return this.http.get("devicetypes", this.options).map(response => response.json());
  }

  CreateBulkDevices(devices: Device[]): Observable<BulkUpdateResponse[]> {
    return this.http.post("devices/bulk/add", devices, this.options).map(response => response.json());
  }

  ResolveDNSAddress(deviceID: string): Observable<string> {
    return this.http.get("devices/"+deviceID+"/address", this.options).map(response => response.json());
  }

  ///// OPTIONS FUNCTIONS /////
  GetDeviceRolesList(): Observable<Role[]> {
    return this.http.get("deviceroles", this.options).map(response => response.json());
  }

  GetTemplates(): Observable<Template[]> {
    return this.http.get("templates", this.options).map(response => response.json());
  }

  GetRoomDesignations(): Observable<string[]> {
    return this.http.get("roomdesignations", this.options).map(response => response.json());
  }

  GetIcons(): Observable<string[]> {
    return this.http.get("icons", this.options).map(response => response.json());
  }
  

  ///// UI CONFIG FUNCTIONS /////
  GetUIConfig(roomID: string): Observable<UIConfig> {
    return this.http.get("uiconfig/" + roomID, this.options).map(response => response.json());
  }

  AddUIConfig(roomID: string, toAdd: UIConfig): Observable<any> {
    return this.http.post("uiconfig/" + roomID + "/add", toAdd, this.options).map(response => response.json());
  }

  UpdateUIConfig(roomID: string, toEdit: UIConfig): Observable<any> {
    return this.http.put("uiconfig/" + roomID + "/update", toEdit, this.options).map(response => response.json());
  }

  
  ///// AUTH FUNCTIONS /////
  HasAdminRights(): Observable<boolean> {
    return this.http.get("auth/admin", this.options).map(response => response.json());
  }

  ///// CHANGELOG FUNCTIONS /////
  ClearTempChanges() {
    this.http.get("changes/clear", this.options);
  }

  WriteTempChanges() {
    this.http.get("changes/write", this.options);
    setTimeout(() => {
      this.ClearTempChanges();
    }, 2000);
  }

  GetState(buildingID: string, roomID: string): Observable<any> {
    return this.http.get("buildings/" + buildingID + "/rooms/" + roomID, this.options).map(response => response.json());
  }

  SetState(buildingID: string, roomID: string, payload: string): Observable<any> {
    return this.http.put("buildings/" + buildingID + "/rooms/" + roomID, payload, this.options).map(response => response.json());
  }

  SubscribeToRoom(buildingID: string, roomID: string): Observable<any> {
    return this.http.get("buildings/" + buildingID + "/rooms/" + roomID + "/subscribe", this.options).map(response => response.json());
  }

  UnsubscribeToRoom(buildingID: string, roomID: string): Observable<any> {
    return this.http.get("buildings/" + buildingID + "/rooms/" + roomID + "/unsubscribe", this.options).map(response => response.json());
  }
}
