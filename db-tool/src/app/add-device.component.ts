import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Rx';
import { APIService } from './api.service';
import { Device, Configuration, DeviceType, Powerstate, Port, Command, Microservice, Endpoint, DeviceRoleDefinition } from './objects';

@Component({
	selector: 'add-device',
	templateUrl: './add-device.component.html',
	providers: [APIService]
})

export class AddDeviceComponent implements OnInit {
	toadd: Device;

	currBuilding: string;
	currRoom: string;
// configuration stuff
	configuration: any;
	devicetypes: DeviceType[]; powerstates: Powerstate[];
	ports: Port[];
	commands: Command[];
	microservices: Microservice[];
	endpoints: Endpoint[]; 
	deviceroledefinitions: DeviceRoleDefinition;

	public bool = [
		{value: true, display: "True"},
		{value: false, display: "False"}
	];

	constructor(
		private api: APIService,
		private route: ActivatedRoute,
		private location: Location
	) {
		this.route.queryParams.subscribe(params => {
			this.currBuilding = params["building"];
			this.currRoom = params["room"];
		})
	}

	ngOnInit(): void {
		this.getConfig();
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
								this.ports = this.configuration.Ports;
								this.commands = this.configuration.Commands;
								this.microservices = this.configuration.Microservices;
								this.endpoints = this.configuration.Endpoints;
								this.deviceroledefinitions = this.configuration.DeviceRoleDefinitions;
							});	
	}

	addPort() {
		console.log("opening add port dialog");	
	}
}


