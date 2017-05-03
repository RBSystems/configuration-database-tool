import { Component, OnInit, Directive } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Observable } from 'rxjs/Rx';

import { APIService } from './api.service';
import { Configuration, DeviceType, Powerstate, Port, Command, Microservice, Endpoint, DeviceRoleDefinition, GenericConfig } from './objects';

@Component({
  selector: 'configuration',
  templateUrl: './configuration.component.html',
  providers: [APIService],
})

export class ConfigurationComponent implements OnInit {
  configuration: any;
  devicetypes: DeviceType[];
  powerstates: Powerstate[];
  ports: Port[];
  commands: Command[];
  microservices: Microservice[];
  endpoints: Endpoint[];
  deviceroledefinitions: DeviceRoleDefinition;

  selectedDT: boolean;
  selectedPS: boolean;
  selectedP: boolean;
  selectedC: boolean;
  selectedM: boolean;
  selectedE: boolean;
  selectedDRD: boolean;

  selected: any;
  selectedS: string;

  toadd: GenericConfig;

  ngOnInit(): void {
    this.getConfig();
    this.setActive('dt');
    this.clearToAdd();
  }

  constructor(private api: APIService) { }

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

  clearToAdd() {
    this.toadd = {
      name: "",
      description: "",
    }
  }

  setActive(selected: string) {
    this.selected = null;
    this.selectedS = selected;
    this.selectedDT = false;
    this.selectedPS = false;
    this.selectedP = false;
    this.selectedC = false;
    this.selectedM = false;
    this.selectedE = false;
    this.selectedDRD = false;

    switch (selected) {
      case 'dt':
        this.selectedDT = true;
        break;
      case 'ps':
        this.selectedPS = true;
        break;
      case 'p':
        this.selectedP = true;
        break;
      case 'c':
        this.selectedC = true;
        break;
      case 'm':
        this.selectedM = true;
        break;
      case 'e':
        this.selectedE = true;
        break;
      case 'drd':
        this.selectedDRD = true;
        break;
      default:
        this.selectedDT = true;
        console.log("selectedS was", this.selectedS);
        break;
    }
  }

  onSelect(anything: any) {
    this.selected = anything;
  }

  postData() {
    var url = "/devices/";

    switch (this.selectedS) {
      case 'dt':
        url += "types/" + this.toadd.name;
        break;
      case 'ps':
        url += "powerstates/" + this.toadd.name;
        break;
      case 'p':
        url += "ports/" + this.toadd.name;
        break;
      case 'c':
        url += "commands/" + this.toadd.name;
        break;
      case 'm':
        url += "microservices/" + this.toadd.name;
        break;
      case 'e':
        url += "endpoints/" + this.toadd.name;
        break;
      case 'drd':
        url += "roledefinitions/" + this.toadd.name;
        break;
      default:
        console.log("something is messed up. selected =", this.selectedS);
        break;
    }
    console.log("url =", url);

    this.api.postData(url, this.toadd)
      .subscribe(
      data => {
        console.log("success");
        // refresh data
        this.getConfig();
        return true;
      }, error => {
        console.error("failed to post data");
        console.error(error.json());
        return Observable.throw(error);
      })

    this.clearToAdd();
  }
}
