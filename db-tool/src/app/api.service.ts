import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { MatDialog } from '@angular/material';

import 'rxjs/add/operator/map';
import { Building, Room, RoomConfiguration, Device, DeviceType, Template } from './objects';
import { ModalComponent, MessageType, Result } from './modal/modal.component';

@Injectable()
export class ApiService {
  // url: string = "http://10.5.34.100:9999";
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

  GetRoomByID(roomID: string): Observable<Room> {
    return this.http.get(this.url + "/rooms/" + roomID, this.options).map(response => response.json());
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

  GetAllRooms(): Observable<Room[]> {
    return this.http.get(this.url + "/rooms", this.options).map(response => response.json());
  }

  SubmitNewData(buildingData: Building, buildingExists: boolean, roomData: Room, deviceData: Device[], callback) {
    let results: Result[] = [];
    let done: boolean = false;

    if(!buildingExists) {
      this.AddBuilding(buildingData).subscribe(
      success => {
        let message = buildingData._id + " was successfully added.";
        let res: Result = {message: message, success: true}
        results.push(res);
      },
      error => {
        let message = "Failed to add " + buildingData._id;
        let res: Result = {message: message, success: false, error: error}
        results.push(res);
      });
    }
    else {
      this.UpdateBuilding(buildingData).subscribe(
      success => {
        let message = buildingData._id + " was successfully updated.";
        let res: Result = {message: message, success: true}
        results.push(res);
      },
      error => {
        let message = "Failed to update " + buildingData._id;
        let res: Result = {message: message, success: false, error: error}
        results.push(res);
      });
    }

    this.AddRoom(roomData).subscribe(
    success => {
      let message = roomData._id + " was successfully added.";
      let res: Result = {message: message, success: true}
      results.push(res);
    },
    error => {
      let message = "Failed to add " + roomData._id;
      let res: Result = {message: message, success: false, error: error}
      results.push(res);
    });

    deviceData.forEach(device => {
      this.AddDevice(device).subscribe(
      success => {
        let message = device._id + " was successfully added.";
        let res: Result = {message: message, success: true}
        results.push(res);
        if(deviceData.indexOf(device) == deviceData.length-1) {
          callback(results);
        }
      },
      error => {
        let message = "Failed to add " + device._id;
        let res: Result = {message: message, success: false, error: error}
        results.push(res);
        if(deviceData.indexOf(device) == deviceData.length-1) {
          callback(results);
        }
      });
    });
  }

  ShowResults(results: Result[]) {
    let pass: boolean = true;
    let mixed: boolean = false;
    let errorCount: number = 0;

    results.forEach(r => {
      if(!r.success) {
        pass = false;
        mixed = true;
        errorCount++;
      }
    });

    if(errorCount == results.length) {
      pass = false;
      mixed = false;
    }

    if(pass && !mixed && errorCount == 0) {
      this.openDialog(MessageType.Success, "All Information Succeeded", null, results);
    }
    else if(!pass && mixed) {
      this.openDialog(MessageType.Mixed, "Some Information Failed", null, results);
    }
    else if(!pass && !mixed && errorCount == results.length) {
      this.openDialog(MessageType.Error, "All Information Failed", null, results);
    }
  }

  openDialog(status: MessageType, subheader: string, message?: string, results?: Result[]) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {type: status, subheader: subheader, message: message, results: results}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
