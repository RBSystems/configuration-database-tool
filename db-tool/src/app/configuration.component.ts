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

  selectedDT: DeviceType;
  selectedPS: Powerstate;
  selectedP: Port;
  selectedC: Command;
  selectedM: Microservice;
  selectedE: Endpoint;
  selectedDRD: DeviceRoleDefinition;

  ngOnInit(): void {
    this.getConfig();
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

  updateDT(dt: DeviceType) {
    this.selectedDT = dt;
  }

  updatePS(ps: Powerstate) {
    this.selectedPS = ps;
  }

  updateP(p: Port) {
    this.selectedP = p;
  }

  updateC(c: Command) {
    this.selectedC = c;
  }

  updateM(m: Microservice) {
    this.selectedM = m;
  }

  updateE(e: Endpoint) {
    this.selectedE = e;
  }

  updateDRD(drd: DeviceRoleDefinition) {
    this.selectedDRD = drd;
  }
}
