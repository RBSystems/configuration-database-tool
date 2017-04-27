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
	//
	// is there a table in the database with available roomDesignations?
	// just hardcoded for now:) 
	//
	toadd: Room;

	buildings: any; 
	currBuilding: string;
	myCurrBuilding: string;
	roomConfigs: any;
	currConfig: string;

	constructor(private api: APIService) {}

	ngOnInit(): void {
		this.api.getBuildings().subscribe(val => this.buildings = val);
		this.api.getRoomConfigs().subscribe(val => this.roomConfigs = val);

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
		this.toadd.roomDesignation = "production";
	}

	setBuildingID(target: any) {
		console.log("setting building id to " + target.value);
		this.toadd.building.id = Number(target.value);
		this.myCurrBuilding = target.options[target.selectedIndex].text;
		console.log("myCurrBuilding = " + this.myCurrBuilding);
	}

	setConfigurationID(id: number){
		console.log("setting config id to " + id);
		this.toadd.configurationID = Number(id);
	}

	setRoomDesignation(s: string) {
		console.log("setting roomDesignation to " + s);
		this.toadd.roomDesignation = s;
	}

	postData() {
		this.api.postData("/buildings/" + this.myCurrBuilding + "/rooms/" + this.toadd.name, this.toadd)
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
