import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { APIService } from './api.service';
import { Building, Room } from './objects';

@Component({
	selector: 'room-selection',
	templateUrl: './room-selection.component.html',
	styleUrls: ['./room-selection.component.css'],
	providers: [APIService]
})

export class RoomSelectionComponent implements OnInit {
	buildings: any;
	rooms: any;
	currBuilding: string;
	currRoom: string;	

	ngOnInit(): void {
		this.getBuildings();
	}

	constructor(
		private api: APIService,
	 	private router: Router
	) {}

  	getBuildings(): Object {  	
	  return this.api.getBuildings().subscribe(val => this.buildings = val); 
  	}

  	getRooms(building: string): Object {
		this.currRoom = null;
  		return this.api.getRooms(building).subscribe(val => this.rooms = val);
  	}

	switchToDevices(building: string, room: string): void {
		let navigationExtras: NavigationExtras = {
			queryParams: {
				"building": this.currBuilding,
				"room": this.currRoom
			}
		};

		this.router.navigate(['/room-editor'], navigationExtras);
	}
}
