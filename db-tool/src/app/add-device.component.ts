import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Rx';
import { APIService } from './api.service';
import { Device, Configuration, DeviceType, Powerstate, Port, Command, Microservice, Endpoint, DeviceRoleDefinition, PortConfig, DeviceCommand } from './objects';

@Component({
  selector: 'add-device',
  templateUrl: './add-device.component.html',
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

  public bool = [
    { value: true, display: "True" },
    { value: false, display: "False" }
  ];

  constructor(
    private api: APIService, private route: ActivatedRoute,
    private location: Location
  ) {
    this.route.queryParams.subscribe(params => {
      this.currBuilding = params["building"];
      this.currRoom = params["room"];
    })
  }

  ngOnInit(): void {
    /*		if(this.currBuilding == null || this.currRoom == null) {
                alert("Please select a building and room first");
                this.location.back();
                return;
            }
    */
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
    this.currBuilding = "DSNB";
    this.currRoom = "420";
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
}


