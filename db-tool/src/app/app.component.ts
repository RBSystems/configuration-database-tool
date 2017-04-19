import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  currBuilding: string; 
  currRoom: string;
  rooms = ROOMS;
  buildings = BUILDINGS;
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
