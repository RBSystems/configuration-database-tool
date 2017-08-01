import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
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

  currBuilding: string;
  currRoom: string;

  roomData: any;
  id: number;
  name: string;
  description: string;
  building: Building;
  devices: Device[];
  configurationID: number;
  public configuration: RoomConfiguration;
  public roomDesignation: string;

  currDevice: Device;
  currDeviceState: any;
  selectedPort: PortConfig;
  selectedCommand: DeviceCommand;
  availableTypes: {};
  availableClasses: {};

  configurationOptions: any;
  
    
  public selectionModalInfo:any;

  constructor(
    private api: APIService,
    private route: ActivatedRoute,
    private location: Location
  ) {
      this.selectionModalInfo = {};
      this.currDeviceState = {'editing': false, 'edits': {}};

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
   
  editDevice() {
      console.log("editing");
      if (this.currDevice == null) 
          return;
      this.prepForEdits();
      this.currDeviceState.editing = true;
  }

  cancelDeviceEdits() {
      if (this.currDevice == null) 
          return;
      this.currDeviceState.editing = false
  }

  selectDevice(d: Device) {
    if (this.currDevice != null) 
        this.currDevice.selected = false
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

    

  editCurDeviceType() {
      //we need to open a modal
      this.selectionModalInfo.Title = "device type";
      this.selectionModalInfo.options = this.buildTypeOptions();
      this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options)
      this.selectionModalInfo.callback = function(deviceState, option) { 
          deviceState.edits.type = option.display;
      };
      this.selectSingleOption.show();
  }

  editCurDeviceClass() {
      //we need to open a modal
      this.selectionModalInfo.Title = "device class";
      this.selectionModalInfo.options = this.buildClassOptions();
      this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options)
      this.selectionModalInfo.callback = function(deviceState, option) { 
          deviceState.edits.class = option.display;
      };
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
