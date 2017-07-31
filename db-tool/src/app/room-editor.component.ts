import { Component, OnInit, ViewChild } from '@angular/core';
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
  
    
  public selectionModalInfo:any;

  constructor(
    private api: APIService,
    private route: ActivatedRoute,
    private location: Location
  ) {
      this.selectionModalInfo = {};
      this.currDeviceState = {'editing': false, 'edits': {}};
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

  editCurDeviceType() {

      console.log("editing type");

      //we need to open a modal
      this.selectionModalInfo.Title = "device type";
      this.selectionModalInfo.options = ["John", "Jimmer Fredette", "joe", "brandon Smith", "frank Smith", "Brandon Valkarye"];
      this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options)
      this.selectionModalInfo.callback = function(deviceState, name) { 
          deviceState.edits.type = name;
      };
      this.selectSingleOption.show();
  }

  editCurDeviceClass() {
      console.log("editing class");
  }

  filterModalOptions(value) {
      if (!value) {
          this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options); 
          return
      }

      this.selectionModalInfo.filteredOptions = Object.assign([], this.selectionModalInfo.options).filter( 
          item => item.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
  }
}
