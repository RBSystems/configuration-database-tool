import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/map';
import { Building, Room, RoomConfiguration, Device, DeviceType, Template } from './objects';

@Injectable()
export class ApiService {
  // url: string = "http://10.5.34.100:9999";
  url: string = '';
  options: RequestOptions;
  headers: Headers;
  constructor(private http: Http) {
    this.headers = new Headers(
      {'Content-Type': 'application/json'}
    );

    this.options = new RequestOptions({headers : this.headers}); 
  }

  GetBuildingList(): Observable<Building[]> {
    return this.http.get(this.url+"/buildings", this.options).map(response => response.json());
  }

  AddBuilding(toAdd: Building): Observable<any> {
    return this.http.post(this.url + "/buildings/" + toAdd._id, toAdd, this.options).map(response => response.json());
  }

  UpdateBuilding(toEdit: Building): Observable<any> {
    return this.http.put(this.url + "/buildings/" + toEdit._id + "/update", toEdit, this.options).map(response => response.json());
  }

  GetRoomList(building: string): Observable<Room[]> {
    return this.http.get(this.url+"/buildings/" + building + "/rooms", this.options).map(response => response.json());
  }

  AddRoom(toAdd: Room): Observable<any> {
    return this.http.post(this.url + "/rooms/" + toAdd._id + "/add", toAdd, this.options).map(response => response.json());
  }

  UpdateRoom(toEdit: Room): Observable<any> {
    return this.http.put(this.url + "/rooms/" + toEdit._id + "/update", toEdit, this.options).map(response => response.json());
  }

  GetRoomConfigurations(): Observable<RoomConfiguration[]> {
    return this.http.get(this.url + "/roomconfigurations", this.options).map(response => response.json());
  }

  GetRoomDesignations(): Observable<string[]> {
    return this.http.get(this.url + "/roomdesignations", this.options).map(response => response.json());
  }

  AddDevice(toAdd: Device): Observable<any> {
    return this.http.post(this.url + "/devices/" + toAdd._id + "/add", toAdd, this.options).map(response => response.json());
  }

  UpdateDevice(toEdit: Device): Observable<any> {
    return this.http.put(this.url + "/devices/" + toEdit._id + "/update", toEdit, this.options).map(response => response.json());
  }

  GetDeviceList(room: string): Observable<Device[]> {
    return this.http.get(this.url + "/rooms/" + room + "/devices", this.options).map(response => response.json());
  }

  GetDeviceTypesList(): Observable<DeviceType[]> {
    return this.http.get(this.url + "/devicetypes", this.options).map(response => response.json());
  }

  GetDeviceRolesList(): Observable<string[]> {
    return this.http.get(this.url + "/deviceroles", this.options).map(response => response.json());
  }

  GetTemplates(): Observable<Template[]> {
    return this.http.get(this.url + "/templates", this.options).map(response => response.json());
  }
}
