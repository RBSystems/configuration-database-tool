import { Component, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormGroupDirective, FormControl, NgForm, Validators, FormGroup, FormBuilder, ControlValueAccessor } from '@angular/forms';
import { MatStepper } from '@angular/material';
import { ApiService } from '../api.service';
import { Building, Room, Template, Device, DeviceType } from '../objects';


export class DBError implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  buildingList: Building[];
  roomList: Room[];
  allRoomList: Room[];
  buildingExists: boolean;
  roomExists: boolean;
  locationDone: boolean;
  locBuilding: Building;
  locRoom: Room;
  theType: DeviceType;

  templateList: Template[];
  currentTemplate: Template;
  customTemplate: Template;
  deviceListSize: number;
  extraDeviceList: Device[];

  locationFormGroup: FormGroup;
  locationDetailFormGroup: FormGroup;
  locationMatcher = new DBError();
  locationFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern("^([a-zA-Z0-9]*-[a-zA-Z0-9]*){1}$")
  ]);

  deviceTypeList: DeviceType[];

  typesOnTheTemplate: DeviceType[] = [];

  constructor(private _formBuilder: FormBuilder, private api: ApiService) { }

  ngOnInit() {
    this.locationFormGroup = this._formBuilder.group({
      locationCtrl: ['', Validators.required]
    });
    this.locationDetailFormGroup = this._formBuilder.group({
      locDetailCtrl: ['', Validators.required]
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
    console.log(this.templateList[0].devices[0])
    this.buildingExists = false;
    this.roomExists = false;
    let roomID : string = this.locationFormControl.value;
    let buildingID = roomID.split("-", 2)[0];

    this.buildingList.forEach(b => {
      if(b._id == buildingID) {
        this.buildingExists = true;
        this.locBuilding = b;
      }
    });

    this.allRoomList.forEach(r => {
      if(r._id == roomID) {
        this.roomExists = true;
        this.locRoom = r;
      }
    });

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

      this.templateList.forEach(t => {
        t.devices.forEach(d => {
          this.typesOnTheTemplate.push(d.type);
        })
      })

    });
  }

  getDeviceTypeList() {
    this.deviceTypeList = [];
    this.api.GetDeviceTypesList().subscribe(val => {
      this.deviceTypeList = val;
    });
  }

  UpdateAccordion() {
    this.deviceListSize = this.currentTemplate.devices.length;

    let max = this.deviceListSize
    this.extraDeviceList = [];

    for (let i = 0; i < max; i++) {
      if(i < this.currentTemplate.devices.length) {
        // Update device ID
        this.currentTemplate.devices[i]._id = this.locRoom._id + "-" + this.currentTemplate.devices[i].name;
        
        this.deviceTypeList.forEach(type => {
          if(type._id == this.currentTemplate.devices[i].type._id) {
            this.currentTemplate.devices[i].type = new DeviceType();
            this.currentTemplate.devices[i].type._id = type._id;
            this.theType = type;
          }
        })
        // Update device address
        if(this.currentTemplate.devices[i].type._id == "non-controllable") {
          this.currentTemplate.devices[i].address = "0.0.0.0";
        }
        else {
          this.currentTemplate.devices[i].address = this.currentTemplate.devices[i]._id + ".byu.edu"
        }
        this.extraDeviceList.push(this.currentTemplate.devices[i]);
      }
      else {
        let d = new Device();
        d._id = this.locationFormControl.value + "-";
        this.extraDeviceList.push(d);
      }
    }
  }

  Check() {
    console.log(this.templateList[0].devices[0])
    // console.log(this.locBuilding)
    // console.log(this.locRoom)
    // console.log(this.extraDeviceList)
  }
}
