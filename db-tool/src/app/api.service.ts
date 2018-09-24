import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { MatDialog } from '@angular/material';

import 'rxjs/add/operator/map';
import { Building, Room, RoomConfiguration, Device, DeviceType, Template, BulkUpdateResponse, UIConfig, Role } from './objects';

@Injectable()
export class ApiService {
  // url: string = "http://localhost:9999";
  url: string = '';
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
    return this.http.get(this.url+"/buildings", this.options).map(response => response.json());
  }

  AddBuilding(toAdd: Building): Observable<any> {
    return this.http.post(this.url + "/buildings/" + toAdd._id, toAdd, this.options).map(response => response.json());
  }

  UpdateBuilding(IDToEdit: string, toEdit: Building): Observable<any> {
    return this.http.put(this.url + "/buildings/" + IDToEdit + "/update", toEdit, this.options).map(response => response.json());
  }


  ///// ROOM FUNCTIONS /////
  GetRoomList(building: string): Observable<Room[]> {
    return this.http.get(this.url+"/buildings/" + building + "/rooms", this.options).map(response => response.json());
  }

  GetRoomByID(roomID: string): Observable<Room> {
    return this.http.get(this.url + "/rooms/" + roomID, this.options).map(response => response.json());
  }

  AddRoom(toAdd: Room): Observable<any> {
    return this.http.post(this.url + "/rooms/" + toAdd._id + "/add", toAdd, this.options).map(response => response.json());
  }

  UpdateRoom(IDToEdit: string, toEdit: Room): Observable<any> {
    return this.http.put(this.url + "/rooms/" + IDToEdit + "/update", toEdit, this.options).map(response => response.json());
  }

  GetRoomConfigurations(): Observable<RoomConfiguration[]> {
    return this.http.get(this.url + "/roomconfigurations", this.options).map(response => response.json());
  }

  GetAllRooms(): Observable<Room[]> {
    return this.http.get(this.url + "/rooms", this.options).map(response => response.json());
  }


  ///// DEVICE FUNCTIONS /////
  AddDevice(toAdd: Device): Observable<any> {
    return this.http.post(this.url + "/devices/" + toAdd._id + "/add", toAdd, this.options).map(response => response.json());
  }

  UpdateDevice(IDToEdit: string, toEdit: Device): Observable<any> {
    return this.http.put(this.url + "/devices/" + IDToEdit + "/update", toEdit, this.options).map(response => response.json());
  }

  GetDeviceList(room: string): Observable<Device[]> {
    return this.http.get(this.url + "/rooms/" + room + "/devices", this.options).map(response => response.json());
  }

  GetDeviceTypesList(): Observable<DeviceType[]> {
    return this.http.get(this.url + "/devicetypes", this.options).map(response => response.json());
  }

  CreateBulkDevices(devices: Device[]): Observable<BulkUpdateResponse[]> {
    return this.http.post(this.url + "/devices/bulk/add", devices, this.options).map(response => response.json());
  }


  ///// OPTIONS FUNCTIONS /////
  GetDeviceRolesList(): Observable<Role[]> {
    return this.http.get(this.url + "/deviceroles", this.options).map(response => response.json());
  }

  GetTemplates(): Observable<Template[]> {
    return this.http.get(this.url + "/templates", this.options).map(response => response.json());
  }

  GetRoomDesignations(): Observable<string[]> {
    return this.http.get(this.url + "/roomdesignations", this.options).map(response => response.json());
  }

  GetIcons(): Observable<string[]> {
    return this.http.get(this.url + "/icons", this.options).map(response => response.json());
  }
  

  ///// UI CONFIG FUNCTIONS /////
  GetUIConfig(roomID: string): Observable<UIConfig> {
    return this.http.get(this.url + "/uiconfig/" + roomID, this.options).map(response => response.json());
  }

  AddUIConfig(roomID: string, toAdd: UIConfig): Observable<any> {
    return this.http.post(this.url + "/uiconfig/" + roomID + "/add", toAdd, this.options).map(response => response.json());
  }

  UpdateUIConfig(roomID: string, toEdit: UIConfig): Observable<any> {
    return this.http.put(this.url + "/uiconfig/" + roomID + "/update", toEdit, this.options).map(response => response.json());
  }

  
  ///// AUTH FUNCTIONS /////
  HasAdminRights(): Observable<boolean> {
    return this.http.get(this.url + "/auth/admin", this.options).map(response => response.json());
  }

  ///// CHANGELOG FUNCTIONS /////
  ClearTempChanges() {
    this.http.get(this.url + "/changes/clear", this.options);
  }
}
