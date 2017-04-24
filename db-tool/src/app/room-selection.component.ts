import { Component, OnInit } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Http, Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';

import { APIService } from './api.service'

@Component({
	selector: 'room-selection',
	templateUrl: './room-selection.component.html',
	styleUrls: ['./room-selection.component.css'],
	providers: [APIService]
})

export class RoomSelectionComponent implements OnInit {
	buildings: Object;
	rooms: Object;
	currBuilding: string;
	currRoom: string;	

	ngOnInit(): void {
		this.getBuildings();
	}

	constructor(private api: APIService) {}

  	getBuildings(): Object {  	
	  return this.api.getBuildings().subscribe(val => this.buildings = val); 
  	}

  	getRooms(building: string): Object {
		this.currRoom = null;
  		return this.api.getRooms(building).subscribe(val => this.rooms = val);
  	}
}
