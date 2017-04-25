import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { APIService } from './api.service';

@Component({
	selector: 'configuration',
	templateUrl: './configuration.component.html',
	styleUrls: ['./configuration.component.css'],
	providers: [APIService],
})

export class ConfigurationComponent implements OnInit {
	configuration: any;
	devicetypes: DeviceType[];
	powerstates: Object;
	ports: Object;
	commands: Object;
	microservices: Object;
	endpoints: Object;
	deviceroledefinitions: Object;

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
	//	this.DeviceTypes = JSON.parse(this.configuration.toString()).DeviceTypes;
	}
}

export class Configuration {
	DeviceTypes: DeviceType[];
	PowerStates: PowerState[];
	Ports: Port[];
	Commands: Command[];
	Microservices: Microservice[];
	Endpoints: Endpoint[];
	DeviceRoleDefinitions: DeviceRoleDefinition[];
}

export class DeviceType {
	id: number;
	name: string;
	description: string;
}

export class PowerState {
	id: number;
	name: string;
	description: string;
}

export class Port {
	id: number;
	name: string;
	description: string;
}

export class Command {
	id: number;
	name: string;
	description: string;
	priority: number;
}

export class Microservice {
	id: number;
	name: string;
	address: string;
	description: string;
}

export class Endpoint {
	id: number;
	name: string;
	path: string;
	description: string;
}

export class DeviceRoleDefinition {
	id: number;
	name: string;
	description: string;
}
