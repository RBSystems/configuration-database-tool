import { Component, OnInit } from '@angular/core';

import { APIService } from './api.service';

@Component({
	selector: 'add-building',
	templateUrl: './add-building.component.html',
	providers: [],
})

export class AddBuildingComponent implements OnInit {
	toadd: toAdd; 

	constructor(private api: APIService) {}

	ngOnInit(): void {
		this.toadd = {
			name: "",
			shortname: "",
			description: ""
		};
	}	

	postData(): string {
		
		return "success!";	
	}
}

export class toAdd {
	name: string;
	shortname: string;
	description: string;
}
