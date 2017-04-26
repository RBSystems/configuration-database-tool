import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { APIService } from './api.service';

@Component({
	selector:'devices',
	templateUrl: './devices.component.html',
	providers: [APIService]
})

export class DevicesComponent implements OnInit {
	building: string;
	room: string;
	devices: any;	

	constructor(
		private api: APIService,
		private route: ActivatedRoute 
	) {
		this.route.queryParams.subscribe(params => {
			this.building = params["building"];
			this.room = params["room"];
		})	
	}

	ngOnInit(): void {
		this.getDevices();
	}

	getDevices(): Object {
		this.devices = null;
		return this.api.getDevices(this.building, this.room).subscribe(val => this.devices = val);	
	}
}
