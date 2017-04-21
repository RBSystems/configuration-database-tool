import { Component, OnInit } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Http, Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';

import { APIService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [APIService]
})

export class AppComponent implements OnInit {
  title = 'app works!';
  currBuilding: string; 
  currRoom: string;
  rooms: Object;
  buildings: Object;

  constructor(private api: APIService) {}

  getBuildings(): Object {  	
  	return this.api.getBuildings().subscribe(val => this.buildings = val); 
  }

  getRooms(building: string): Object {
  	return this.api.getRooms(building).subscribe(val => this.rooms = val);
  }

  ngOnInit(): void {
 	this.getBuildings();
	this.getRooms('ITB');
  }
}
