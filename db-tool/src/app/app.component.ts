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
  rooms = ROOMS;
  buildings: string;

  constructor(private api: APIService) {}

  getBuildings(): Object {  	
  	return this.api.getBuildings().subscribe(val => console.log(val)); 
  }

  ngOnInit(): void {
 	this.getBuildings();
  }
}

export class Building {
	name: string;
}

export class Room {
	name: string;
}

const BUILDINGS: Building[] = [
	{ name: "ITB" },
	{ name: "MSB" },
	{ name: "TMCB" }
];

const ROOMS: Room[] = [
	{ name: "1004" },
	{ name: "1006" },
	{ name: "1010" }
];
