import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Params, Router, NavigationExtras  } from '@angular/router';
import { Location } from '@angular/common';

import { APIService } from './api.service';
import { SwitcherPort, Building, Room, Device, RoomConfiguration, PortConfig, DeviceCommand } from './objects';

import { ModalComponent } from './modal.component';
@Component({
  selector: 'devices',
  templateUrl: './room-editor.component.html',
  styleUrls: ['./room-selection.component.scss'],
  providers: [APIService]
})


export class RoomEditorComponent implements OnInit {

  @ViewChild('selectSingleOption') selectSingleOption:ModalComponent;
  @ViewChild('confirmCommit') confirmCommit:ModalComponent;
  @ViewChild('noCommitsModal') noCommitsModal:ModalComponent;
  @ViewChild('successCommit') successCommit:ModalComponent;
  @ViewChild('setDeviceRoles') setDeviceRolesModal:ModalComponent;

  currBuilding: string;
  currRoom: string;

  roomData: any;
  id: number;
  name: string;
  description: string;
  building: Building; devices: Device[];
  configurationID: number;
  public configuration: RoomConfiguration;
  public roomDesignation: string;

  currDevice: Device;
  currDeviceState: any;
  selectedPort: PortConfig;
  selectedCommand: DeviceCommand;
  availableTypes: {};
  availableClasses: {};

  commitCandidates: {};

  configurationOptions: any;
  
    
  public selectionModalInfo:any;

  constructor(
    private api: APIService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
      this.selectionModalInfo = {};
      this.currDeviceState = {'editingClass': false, 'editingInfo': false, 'editingRoles': false, 'edits': {}};

      this.api.getConfig().subscribe(value => {
          this.configurationOptions = value;
      });
      this.route.queryParams.subscribe(params => {
      this.currBuilding = params["building"];
      this.currRoom = params["room"];
    })
  }

  ngOnInit(): void {
    if (this.currBuilding == null || this.currRoom == null) {
      alert("Please select a building and room first");
      this.location.back();
      return;
    }
    this.getDevices();

    this.selectedPort = {
      source: "",
      name: "",
      destination: "",
      host: ""
    }

    this.selectedCommand = {
      name: "",
      microservice: "",
      endpoint: {
        name: "",
      },
      enabled: null
    }
  }

  createDevice() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "building": this.currBuilding,
        "room": this.currRoom
      }
    };

    this.router.navigate(['/add-device'], navigationExtras);
  }

  getDevices(): Object {
    this.roomData = null;
    return this.api.getDevices(this.currBuilding, this.currRoom).subscribe(val => {
      this.roomData = val
      this.id = this.roomData.id;
      this.name = this.roomData.name;
      this.description = this.roomData.description;
      this.building = this.roomData.building;
      this.devices = this.roomData.devices;
      this.configurationID = this.roomData.configurationID;
      this.configuration = this.roomData.configuration;
      this.roomDesignation = this.roomData.roomDesignation;
       
      for (let d of this.devices) {
          if (d.roles.includes("VideoSwitcher")) {
              //we need to calculate the in/out ports and figure out what's plugged into each. 
              d.switcherPortsIn = [];
              d.switcherPortsOut = [];

              var foundIn = {}
              var foundOut = {}

              //go through the ports, calculating the values
              for (let p of d.ports) {
                  var splitStr = p.name.split(":")
                  if (!(splitStr[0] in foundIn)) {
                      foundIn[splitStr[0]] = p.source;
                      var newPort = new SwitcherPort();
                      newPort.name = splitStr[0];
                      newPort.device = p.source;
                      d.switcherPortsIn.push(newPort);
                  }
                  if (!(splitStr[1] in foundOut)) {
                      foundOut[splitStr[1]] = p.destination;
                      var newPort = new SwitcherPort();
                      newPort.name = splitStr[1];
                      newPort.device = p.destination;
                      d.switcherPortsOut.push(newPort);
                  }
              }
          }
      }
      
    });
  }
   
  editDevice(editingType) {
      console.log("editing");
      if (this.currDevice == null) 
          return;
      this.prepForEdits();
      this.currDeviceState[editingType] = true;
  }

  cancelDeviceEdits(editingType) {
      if (this.currDevice == null) 
          return;
      this.currDeviceState[editingType] = false
      this.currDeviceState.edits = {};
  }

  resetCards() {
      if (this.currDevice == null) 
          return;

      this.currDeviceState = {'editingClass': false, 'editingInfo': false, 'editingRoles': false, 'edits': {}};
  }

  commitDeviceEdits() {
      //we need to go through the values and see if they were changed, if so, we send a request to change them. Before we do so we should prompt
      let edits = {};
      for(let key in this.currDevice) {
          if (this.currDevice[key] != this.currDeviceState.edits[key]) {
            //they don't match, so there were edits
            if (this.currDeviceState.edits.toEdit[key]) {
                edits[key] = this.currDeviceState.edits.toEdit[key];
            } else {
                edits[key] = this.currDeviceState.edits[key];
            }
          }
      }
      if (this.isEmpty(edits)) {
          //nothing to edit
          this.noCommitsModal.show();
          return;
      }
      else {
          this.commitCandidates = edits;
          this.confirmCommit.show();
      } 
  }

  saveChanges() {
      let typeMapping = {
          "type": {"name": "typeID", "type": "int"},
          "class": {"name": "classID", "type": "int"},
          "input": {"name": "input", "type": "bool"},
          "output": {"name": "output", "type": "bool"},
          "name": {"name": "name", "type": "string"},
          "address": {"name": "address", "type": "string"}
      }

      console.log(this.commitCandidates);
      let deviceID = this.currDevice.id;
      for (let edit in this.commitCandidates) {
          this.api.setRoomAttribute(typeMapping[edit].name, this.commitCandidates[edit].toString(), deviceID, typeMapping[edit].type).subscribe(value => {
              this.getDevices();
              console.log(value);
              });
      }
      this.confirmCommit.hide();
      this.successCommit.show();
  }

  isEmpty(o: Object): boolean {
      for (let i in o) {
          return false;
      }
      return true
  }

  selectDevice(d: Device) {
    if (this.currDevice != null) 
        this.currDevice.selected = false;

    this.currDeviceState.editing = false;
    this.currDeviceState.edits = {};

    d.selected = true;
    this.currDevice = d;
  }

  selectPort(p: PortConfig) {
    this.selectedPort = p;
  }

  selectCommand(c: DeviceCommand) {
    this.selectedCommand = c;
  }

  prepForEdits() {
      Object.assign(this.currDeviceState.edits, this.currDevice);
      this.currDeviceState.edits.toEdit = {};
  }

  buildTypeOptions(): Object {
      let toReturn = []
      for (let i in this.configurationOptions.DeviceTypes) {
          let dType = this.configurationOptions.DeviceTypes[i];
          let curValue: any = {};

          curValue.display = dType['name'];
          curValue.value = dType;
          toReturn.push(curValue);
      }
      return toReturn;
  }

  buildClassOptions(): Object {
      let toReturn = [];
      for (let i in this.configurationOptions.DeviceClasses) {
          let dClass = this.configurationOptions.DeviceClasses[i];
          let curValue: any = {};

          curValue.display = dClass['display-name'];
          curValue.value = dClass;
          toReturn.push(curValue);
      }
      return toReturn;
  }

  buildRoleOptions(): Object {
      let toReturn = [];
      for (let i in this.configurationOptions.DeviceRoles) {
          let dRole = this.configurationOptions.DeviceRoles[i];
          let curValue: any = {};

          curValue.display = dRole['name'];
          curValue.value = dRole;
          if (this.currDevice.roles.indexOf(curValue.display) > -1) {
              curValue.selected = true;
          } else {
              curValue.selected = false;
          }
          toReturn.push(curValue);
      }
      return toReturn;
  }

 editCurDeviceRoles() {
     this.selectionModalInfo.options = this.buildRoleOptions();
     this.selectionModalInfo.FilterValue = '';
     //we need to show which of the versions are currently selected;
     this.setDeviceRolesModal.show();
 }

  editCurDeviceType() {
      //we need to open a modal
      this.selectionModalInfo.Title = "device type";
      this.selectionModalInfo.options = this.buildTypeOptions();
      this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options)
      this.selectionModalInfo.callback = function(deviceState, option) { 
          deviceState.edits.type = option.display;
          deviceState.edits.toEdit["type"] = option.value.id.toString();
      };
      this.selectionModalInfo.FilterValue = '';
      this.selectSingleOption.show();
  }

  editCurDeviceClass() {
      //we need to open a modal
      this.selectionModalInfo.Title = "device class";
      this.selectionModalInfo.options = this.buildClassOptions();
      this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options)
      this.selectionModalInfo.callback = function(deviceState, option) { 
          deviceState.edits.class = option.display;
          deviceState.edits.toEdit["class"] = option.value.id.toString();
      };
      this.selectionModalInfo.FilterValue = '';
      this.selectSingleOption.show();
  }
  
  filterModalOptions(value) {
      if (!value) {
          this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options); 
          return
      }

      this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options).filter( 
          item => item.display.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
  }
}
