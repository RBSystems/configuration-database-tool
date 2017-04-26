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
	buildingID: number;

	constructor(private api: APIService) {}

	ngOnInit(): void {
		this.toadd = {
			name: "",
			description: "",
		    configurationID: null,
			roomDesignation: ""	
		}	
	//	this.toadd.building.id = null;
		this.configurationID = null;
		this.buildingID = null;
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
