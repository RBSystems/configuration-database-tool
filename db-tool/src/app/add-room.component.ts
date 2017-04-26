import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Rx';

import { APIService } from './api.service';
import { Room } from './objects';

@Component({
	selector: 'add-room',
	templateUrl: './add-room.component.html',
	providers: [APIService],
})

export class AddRoomComponent implements OnInit {
	toadd: Room;
	configurationID: number;

	buildings: any; 
	currBuilding: string;
	RoomConfigs: any;
	currConfig: string;

	constructor(private api: APIService) {}

	ngOnInit(): void {
		this.api.getBuildings().subscribe(val => this.buildings = val);

		this.toadd = {
			name: "",
			description: "",
			building: {
				id: null,
				name: "",
				shortname: "",
				description: ""
			},
		    configurationID: null,
			roomDesignation: ""	
		}	
		this.configurationID = null;
	}

	setBuildingID(id: number) {
		console.log("setting building id to " + id);
		this.toadd.building.id = id;		
	}

	setConfigurationId(id: number){
		console.log("setting config id to " + id);
		this.toadd.configuration.id = id
	}

	postData() {
		this.api.postData("/buildings/" + this.toadd.building.shortname + "/rooms/" + this.toadd.name, this.toadd)
		.subscribe(
			data => {
				//refresh rooms?
				console.log("success");
				return true;
			}, error => {
				console.error("failed to post data");
				console.error(error.json());
				return Observable.throw(error);
			}
		);
	}
}
