import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Rx';
import { APIService } from './api.service';
import { Device, Configuration, DeviceType, Powerstate, Port, Command, Microservice, Endpoint, DeviceRoleDefinition, PortConfig } from './objects';

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
	myPorts: Port[];
	commands: Command[];
	microservices: Microservice[];
	endpoints: Endpoint[]; 
	deviceroledefinitions: DeviceRoleDefinition;

	port: PortConfig; // port to add

	public bool = [
		{value: true, display: "True"},
		{value: false, display: "False"}
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
		this.getConfig();
		this.getDevices();
		this.resetPort();
/*		if(this.currBuilding == null || this.currRoom == null) {
			alert("Please select a building and room first");
			this.location.back();
			return;
		}
*/	
		
		this.toadd = {
			name: "",
			address: "",
			input: null,
			output: null,
			type: "",
			power: "",
			roles: [], powerstates: [],
			ports: [],
			commands: []
		}	
	}

	getConfig(): void {
		this.api.getConfig().subscribe(val => { 
								this.configuration = val; 
								this.devicetypes = this.configuration.DeviceTypes; 
								this.powerstates = this.configuration.PowerStates;
								this.myPorts = this.configuration.Ports;
								this.commands = this.configuration.Commands;
								this.microservices = this.configuration.Microservices;
								this.endpoints = this.configuration.Endpoints;
								this.deviceroledefinitions = this.configuration.DeviceRoleDefinitions;
							});	
	}

	getDevices(): Object {
		this.roomData = null
		return this.api.getDevices("DNB", "gui3").subscribe(val => {
			this.roomData = val
			this.devices = this.roomData.devices;
			});	
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
			host: ""
		}
	}
}


