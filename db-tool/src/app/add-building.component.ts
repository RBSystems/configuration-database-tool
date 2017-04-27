import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { APIService } from './api.service';
import { Building } from './objects';

@Component({
	selector: 'add-building',
	templateUrl: './add-building.component.html',
	providers: [APIService],
})

export class AddBuildingComponent implements OnInit {
	toadd: Building; 

	constructor(private api: APIService) {}

	ngOnInit(): void {
		this.toadd = {
			name: "",
			shortname: "",
			description: ""
		};
	}	

	postData() {
		this.api.postData("/buildings/" + this.toadd.shortname, this.toadd)
			.subscribe(
			data => {
				//refresh buildings
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
