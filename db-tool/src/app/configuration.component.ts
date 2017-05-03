import { Component, OnInit, Directive } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { APIService } from './api.service';
import { Configuration, DeviceType, Powerstate, Port, Command, Microservice, Endpoint, DeviceRoleDefinition } from './objects';

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

  ngOnInit(): void {
    this.getConfig();
    this.selectedDT = true;
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

  setActive(selected: string) {
    this.selected = null;
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
        console.log("selected was", selected);
        break;
    }
  }

  onSelect(anything: any) {
    this.selected = anything;
  }
}
