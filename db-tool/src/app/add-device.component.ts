import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Rx';

import { APIService } from './api.service';
import { Device } from './objects';

@Component({
	selector: 'add-device',
	templateUrl: './add-device.component.html',
	providers: [APIService],
})

export class AddDeviceComponent implements OnInit {
	toadd: Device;

	currBuilding: string;
	currRoom: string;
	currBuildingID: number;
	currRoomID: number;

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
			this.currBuildingID = params["bid"];
			this.currRoomID= params["rid"];
		})
	}

	ngOnInit(): void {
		this.currBuilding = "DNB";
		this.currRoom = "gui4";
		this.currBuildingID = 5;
		this.currRoomID = 37;

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
			building: {
				id: this.currBuildingID,
			},
			room: {
				id: this.currRoomID,
			},
			type: "",
			power: "",
			roles: [""],
			responding: null 
		}	
	}
}


