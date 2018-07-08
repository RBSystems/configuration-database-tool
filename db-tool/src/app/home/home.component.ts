import { Component, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormGroupDirective, FormControl, NgForm, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatStepper } from '@angular/material';
import { ApiService } from '../api.service';
import { Building, Room, Template, Device } from '../objects';
import { P } from '@angular/cdk/keycodes';


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
  buildingExists: boolean;
  roomExists: boolean;
  locationDone: boolean;
  locBuilding: Building;
  locRoom: Room;

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


  constructor(private _formBuilder: FormBuilder, private api: ApiService) { }

  ngOnInit() {
    this.locationFormGroup = this._formBuilder.group({
      locationCtrl: ['', Validators.required]
    });
    this.locationDetailFormGroup = this._formBuilder.group({
      locDetailCtrl: ['', Validators.required]
    });

    this.getBuildingList();
    this.getTemplateList();
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
    this.locBuilding = new Building();
    this.locRoom = new Room();

    let location = this.locationFormControl.value.split("-", 2)
    
    this.buildingList.forEach(bldg => {
      if(bldg._id == location[0]) {
        this.buildingExists = true;
        this.locBuilding = bldg;
      }
    });

    this.getRoomList(location[0]);

    if(this.locationFormControl.valid) {
      this.locationDone = true;
      stepper.next();
    }
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
      this.roomList.forEach(room => {
        if(room._id == this.locationFormControl.value) {
          this.roomExists = true;
          this.locRoom = room;
        }
      });      
    });
  }

  getTemplateList() {
    this.templateList = [];
    this.api.GetTemplates().subscribe(val => {
      this.templateList = val;
      console.log(this.templateList)
    });
  }

  UpdateAccordion() {
    let max = this.deviceListSize
    this.extraDeviceList = [];

    for (let i = 0; i < max; i++) {
      if(i < this.currentTemplate.devices.length) {
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
    console.log(this.locBuilding)
    console.log(this.locRoom)
    console.log(this.extraDeviceList)
  }
}
