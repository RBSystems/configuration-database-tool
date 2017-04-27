import { Component, OnInit } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { APIService } from './api.service';
import { Configuration, DeviceType, Powerstate, Port, Command, Microservice, Endpoint, DeviceRoleDefinition } from './objects';

@Component({
	selector: 'configuration',
	templateUrl: './configuration.component.html',
	styleUrls: ['./configuration.component.css'],
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

	ngOnInit(): void {
		this.getConfig();	
	}

	constructor(private api: APIService) {}

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
}

