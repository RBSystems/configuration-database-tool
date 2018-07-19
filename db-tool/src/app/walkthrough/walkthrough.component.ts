import { Component, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormGroupDirective, FormControl, NgForm, Validators, FormGroup, FormBuilder, ControlValueAccessor } from '@angular/forms';
import { MatStepper, MatDialog } from '@angular/material';
import { ApiService } from '../api.service';
import { Building, Room, Template, Device, DeviceType, BulkUpdateResponse } from '../objects';
import { ModalComponent, MessageType, Result } from '../modal/modal.component';


export class DBError implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-walkthrough',
  templateUrl: './walkthrough.component.html',
  styleUrls: ['./walkthrough.component.css']
})
export class WalkthroughComponent implements OnInit {
  buildingList: Building[];
  roomList: Room[];
  allRoomList: Room[];
  buildingExists: boolean;
  roomExists: boolean;
  step1Complete: boolean;
  locBuilding: Building;
  locRoom: Room;
  theType: DeviceType;

  templateList: Template[];
  currentTemplate: Template;
  customTemplate: Template;
  deviceListSize: number;
  fullRoomDeviceList: Device[];

  locationFormGroup: FormGroup;
  verifyLocationFormGroup: FormGroup;
  locationMatcher = new DBError();
  locationFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern("^([a-zA-Z0-9]*-[a-zA-Z0-9]*){1}$")
  ]);

  deviceTypeList: DeviceType[];
  deviceStep = 0;

  constructor(private _formBuilder: FormBuilder, private api: ApiService, public dialog: MatDialog) { }

  ngOnInit() {
    this.locationFormGroup = this._formBuilder.group({
      locationCtrl: ['', Validators.required]
    });

    this.getBuildingList();
    this.getAllRooms();
    this.getTemplateList();
    this.getDeviceTypeList();
    this.buildingExists = false;
    this.roomExists = false;
    this.locBuilding = new Building();
    this.locRoom = new Room();
    this.currentTemplate = new Template();
    this.customTemplate = new Template();
    this.customTemplate.devices = [];
  }

  ValidateLocation(stepper: MatStepper) {
    this.buildingExists = false;
    this.roomExists = false;
    this.step1Complete = false;
    let roomID : string = this.locationFormControl.value;
    let buildingID = roomID.split("-", 2)[0];

    this.buildingList.forEach(b => {
      if(b._id == buildingID) {
        this.buildingExists = true;
        this.locBuilding = b;
      }
    });

    if(!this.buildingExists) {
      let bldg = new Building();
      bldg._id = buildingID;
      this.locBuilding = bldg;
    }

    this.allRoomList.forEach(r => {
      if(r._id == roomID) {
        this.roomExists = true;
        this.locRoom = r;
      }
    });

    if(!this.roomExists) {
      let room = new Room();
      room._id = roomID;
      this.locRoom = room;
    }

    if(this.buildingExists && this.roomExists) {
      
      let header: string = this.locationFormControl.value + " already exists.";
      let information: string = "Please add or modify the information you need for that room in the individual building, room, and device pages."
      this.openDialog(MessageType.Info, header, information)
      return;
    }

    this.step1Complete = true;
    this.locationFormGroup.updateValueAndValidity();
    stepper.next();
  }

  getBuildingList() {
    this.buildingList = [];
    this.api.GetBuildingList().subscribe(val => {
      this.buildingList = val;
    });
  }

  getRoomList(buildingID : string) {
    this.roomList = [];
    this.api.GetRoomList(buildingID).subscribe(val => {
      this.roomList = val;    
    });
  }

  getAllRooms() {
    this.allRoomList = [];
    this.api.GetAllRooms().subscribe(val => {
      this.allRoomList = val;
    });
  }

  ValidateRoom(roomID: string) {
    this.api.GetRoomByID(roomID).subscribe(val => {
      this.locRoom = val;
      if(this.locRoom._id == roomID) {
        this.roomExists = true;
      }
    });
  }

  getTemplateList() {
    this.templateList = [];
    this.api.GetTemplates().subscribe(val => {
      this.templateList = val;
      console.log(this.templateList)
    });
  }

  getDeviceTypeList() {
    this.deviceTypeList = [];
    this.api.GetDeviceTypesList().subscribe(val => {
      this.deviceTypeList = val;
    });
  }

  UpdateDeviceListSize() {
    // if(this.deviceListSize == null || this.deviceListSize) {
    this.deviceListSize = this.currentTemplate.devices.length;
    // }
  }

  UpdateAccordion(templateChange: boolean) {
    if(this.deviceListSize == null || templateChange) {
      this.deviceListSize = this.currentTemplate.devices.length;
    }
    console.log(this.currentTemplate.devices)
    if(this.fullRoomDeviceList == null || this.fullRoomDeviceList.length == 0 || templateChange) {
      this.fullRoomDeviceList = [];
      this.setStep(0);

      for (let i = 0; i < this.deviceListSize; i++) {
        if(i < this.currentTemplate.devices.length) {
          // Update device ID
          this.currentTemplate.devices[i]._id = this.locRoom._id + "-" + this.currentTemplate.devices[i].name;
  
          // Update device address
          if(this.currentTemplate.devices[i].type._id == "non-controllable") {
            this.currentTemplate.devices[i].address = "0.0.0.0";
          }
          else {
            this.currentTemplate.devices[i].address = this.currentTemplate.devices[i]._id + ".byu.edu"
          }
          this.fullRoomDeviceList.push(this.currentTemplate.devices[i]);
        }
        else {
          let d = new Device();
          d._id = this.locationFormControl.value + "-";
          this.fullRoomDeviceList.push(d);
        }
      }
    }
    else {
      let tempDeviceList = this.fullRoomDeviceList;

      this.fullRoomDeviceList = [];

      for(let j = 0; j < this.deviceListSize; j++) {
        if(j < tempDeviceList.length) {
          this.fullRoomDeviceList.push(tempDeviceList[j]);
        }
        else if(j >= tempDeviceList.length && j < this.currentTemplate.devices.length) {
          // Update device ID
          this.currentTemplate.devices[j]._id = this.locRoom._id + "-" + this.currentTemplate.devices[j].name;
  
          // Update device address
          if(this.currentTemplate.devices[j].type._id == "non-controllable") {
            this.currentTemplate.devices[j].address = "0.0.0.0";
          }
          else {
            this.currentTemplate.devices[j].address = this.currentTemplate.devices[j]._id + ".byu.edu"
          }
          this.fullRoomDeviceList.push(this.currentTemplate.devices[j]);
        }
        else {
          let d = new Device();
          d._id = this.locationFormControl.value + "-";
          this.fullRoomDeviceList.push(d);
        }
      }
    }
  }

  Check() {
    // console.log(this.templateList[0].devices[0])
    console.log(this.locationFormControl.value)
    console.log(this.locBuilding)
    console.log(this.locRoom)
    console.log(this.fullRoomDeviceList)
  }

  Check2(d: Device) {
    console.log(d);
  }

  Finish() {
    console.log(this.fullRoomDeviceList)
    // this.api.SubmitNewData(this.locBuilding, this.buildingExists, this.locRoom, this.fullRoomDeviceList, this.api.ShowResults);
    let results: Result[] = [];
    
    this.SubmitBuilding(results);
  }

  SubmitBuilding(results: Result[]) {
    if(!this.buildingExists) {
      console.log("1A")
      this.api.AddBuilding(this.locBuilding).subscribe(
        success => {
          let message = this.locBuilding._id + " was successfully added.";
          let res: Result = {message: message, success: true}
          results.push(res);
          this.buildingExists = true;
          this.SubmitRoom(results);
        },
        error => {
          let message = "Failed to add " + this.locBuilding._id;
          let res: Result = {message: message, success: false, error: error}
          results.push(res);
          this.SubmitRoom(results);
        });
    }
    else {
      console.log("1B")
      this.api.UpdateBuilding(this.locBuilding).subscribe(
        success => {
          let message = this.locBuilding._id + " was successfully updated.";
          let res: Result = {message: message, success: true}
          results.push(res);
          this.SubmitRoom(results);
        },
        error => {
          let message = "Failed to update " + this.locBuilding._id;
          let res: Result = {message: message, success: false, error: error}
          results.push(res);
          this.SubmitRoom(results);
        });
    }
  }

  SubmitRoom(results: Result[]) {
    if(!this.roomExists) {
      console.log("2A")
      this.api.AddRoom(this.locRoom).subscribe(
        success => {
          let message = this.locRoom._id + " was successfully added.";
          let res: Result = {message: message, success: true}
          results.push(res);
          this.roomExists = true;
          this.SubmitDevices(results);
        },
        error => {
          let message = "Failed to add " + this.locRoom._id;
          let res: Result = {message: message, success: false, error: error}
          results.push(res);
          this.SubmitDevices(results);
        });
    }
    else {
      console.log("2B")
      this.api.UpdateRoom(this.locRoom).subscribe(
        success => {
          let message = this.locRoom._id + " was successfully updated.";
          let res: Result = {message: message, success: true}
          results.push(res);
          this.SubmitDevices(results);
        },
        error => {
          let message = "Failed to update " + this.locRoom._id;
          let res: Result = {message: message, success: false, error: error}
          results.push(res);
          this.SubmitDevices(results);
        });
    }
  }

  SubmitDevices(results: Result[]) {
    console.log("3A")
    this.api.CreateBulkDevices(this.fullRoomDeviceList).subscribe(
      success => {
        console.log("3B")
        let responses: BulkUpdateResponse[] = success;
        responses.forEach(resp => {
          let res: Result;
          let m: string;
          if(resp.success) {
            m = resp._id + " was successfully added.";
            res = {message: m, success: resp.success};
          }
          else {
            m = "Failed to add " + resp._id;
            res = {message: m, success: resp.success, error: resp.message};
          }
          results.push(res);
        });
        this.ShowResults(results);
      },
      error => {
        console.log("3C")
        let m: string = "Failed to add the devices in bulk.";
        let res: Result = {message: m, success: false, error: error};
        results.push(res);
        this.ShowResults(results);
      });
    // for(let i = 0; i < this.fullRoomDeviceList.length; i++) {
    //   let device = this.fullRoomDeviceList[i];
    //   this.api.AddDevice(device).subscribe(
    //   success => {
    //     let message = device._id + " was successfully added.";
    //     let res: Result = {message: message, success: true}
    //     results.push(res);
    //     if((i+1) == this.fullRoomDeviceList.length) {
    //       this.ShowResults(results);
    //     }
    //   },
    //   error => {
    //     let message = "Failed to add " + device._id;
    //     let res: Result = {message: message, success: false, error: error}
    //     results.push(res);
    //     if((i+1) == this.fullRoomDeviceList.length) {
    //       this.ShowResults(results);
    //     }
    //   });
    // }
  }

  ShowResults(results: Result[]) {
    console.log("4A")
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
      if(this.step1Complete) {
        this.step1Complete = false;
      }
      // console.log('The dialog was closed');
    });
  }

  setStep(index: number) {
    this.deviceStep = index;
  }

  nextStep() {
    this.deviceStep++;    
  }

  prevStep() {
    this.deviceStep--;
  }
}
