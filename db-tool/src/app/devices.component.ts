import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { APIService } from './api.service';
import { Building, Room, Device, RoomConfiguration } from './objects';

@Component({
	selector:'devices',
	templateUrl: './devices.component.html',
	providers: [APIService]
})

export class RoomEditorComponent implements OnInit {
	currBuilding: string;
	currRoom: string;

	roomData: any;	
	id: number;
	name: string;
	description: string;
	building: Building;
	devices: Device[];
	configurationID: number;
	configuration: RoomConfiguration;
	roomDesignation: string;

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
		if(this.currBuilding == null || this.currRoom == null) {
			alert("Please select a building and room first");
			this.location.back();	
			return;
		}
		this.getDevices();
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
			});	
	}
}
