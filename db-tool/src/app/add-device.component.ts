import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Rx';

import { APIService } from './api.service';
import { Device, Configuration, DeviceType, Powerstate, Port, Command, Microservice, Endpoint, DeviceRoleDefinition, PortConfig, DeviceCommand } from './objects';

import { ModalComponent } from './modal.component';
@Component({
  selector: 'add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./room-selection.component.scss'],
  providers: [APIService]
})

export class AddDeviceComponent implements OnInit {
  toadd: Device;

  currBuilding: string;
  currRoom: string;
  roomData: any;
  devices: Device[];

  // configuration stuff
  configuration: any;
  devicetypes: DeviceType[];
  powerstates: Powerstate[];
  ports: Port[];
  commands: Command[];
  microservices: Microservice[];
  endpoints: Endpoint[];
  deviceroledefinitions: DeviceRoleDefinition;

  port: PortConfig; // port to add
  command: DeviceCommand; // command to add

  configurationOptions: any;

  @ViewChild('selectSingleOption') selectSingleOption:ModalComponent;
  @ViewChild('setDeviceRoles') setDeviceRoles:ModalComponent;

  public bool = [
    { value: true, display: "True" },
    { value: false, display: "False" }
  ];

  public selectionModalInfo:any;

  constructor(
    private api: APIService, private route: ActivatedRoute,
    private location: Location
  ) {
   this.selectionModalInfo = {};

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

    console.log("form is for building", this.currBuilding, "and room", this.currRoom);
    this.getConfig();
    this.getDevices();
    this.resetPort();
    this.resetCommand();
    this.resetDevices();
  }

  postData() {
    this.api.postData("/buildings/" + this.currBuilding + "/rooms/" + this.currRoom + "/devices/" + this.toadd.name, this.toadd)
      .subscribe(
      data => {
        console.log("success");
        // refresh data
        this.getDevices();
        this.resetDevices();
        return true;
      }, error => {
        console.error("failed to post data");
        console.error(error.json());
        return Observable.throw(error);
      }
      );
  }

  getConfig(): void {
    this.api.getConfig().subscribe(val => {
      this.configuration = val;
      this.devicetypes = this.configuration.DeviceTypes;
      this.powerstates = this.configuration.PowerStates;
      this.ports = this.configuration.Ports;
      this.commands = this.configuration.Commands;
      this.microservices = this.configuration.Microservices;
      this.endpoints = this.configuration.Endpoints;
      this.deviceroledefinitions = this.configuration.DeviceRoleDefinitions;
    });
  }

  getDevices(): Object {
    this.roomData = null
    return this.api.getDevices(this.currBuilding, this.currRoom).subscribe(val => {
      this.roomData = val
      this.devices = this.roomData.devices;
    });
  }

  resetDevices() {
    this.toadd = {
      name: "",
      address: "",
      input: null,
      output: null,
      type: "",
      roles: [],
      powerstates: [],
      ports: [],
      commands: []
    }
  }

  addPort() {
    this.toadd.ports.push(this.port);
    this.resetPort();
  }

  resetPort() {
    this.port = {
      source: "",
      name: "",
      destination: "",
    }
  }

  addCommand() {
    this.toadd.commands.push(this.command);
    this.resetCommand();
  }

  resetCommand() {
    this.command = {
      name: "",
      microservice: "",
      endpoint: {
        name: ""
      }
    }
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
      for (let i in this.configurationOptions.DeviceRoleDefinitions) {
          let dRole = this.configurationOptions.DeviceRoleDefinitions[i];
          let curValue: any = {};

          curValue.display = dRole['name'];
          curValue.value = dRole;
          if (this.toadd.roles.indexOf(curValue.display) > -1) {
              curValue.selected = true;
          } else {
              curValue.selected = false;
          }
          toReturn.push(curValue);
      }
      return toReturn;
  }

  editCurDeviceType() {
      //we need to open a modal
      this.selectionModalInfo.Title = "device type";
      this.selectionModalInfo.options = this.buildTypeOptions();
      this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options)
      this.selectionModalInfo.callback = function(toadd, option) { 
          toadd.type = option.display;
      };
      this.selectionModalInfo.FilterValue = '';
      this.selectSingleOption.show();
  }

  editCurDeviceClass() {
      //we need to open a modal
      this.selectionModalInfo.Title = "device class";
      this.selectionModalInfo.options = this.buildClassOptions();
      this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options)
      this.selectionModalInfo.callback = function(toadd, option) { 
          toadd.class = option.display;
      };
      this.selectionModalInfo.FilterValue = '';
      this.selectSingleOption.show();
  }

  editCurDeviceRoles() {
      this.selectionModalInfo.options = this.buildRoleOptions();
      this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options)
      this.selectionModalInfo.FilterValue = '';
      this.setDeviceRoles.show();
  }
}


