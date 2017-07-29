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
  styleUrls: ['./room-selection.component.scss'],
  providers: [APIService]
})

export class RoomSelectionComponent implements OnInit {
  buildings: any;
  rooms: any;
  currBuilding: any;
  currRoom: any;

  ngOnInit(): void {
    this.getBuildings();
  }

  constructor(
    private api: APIService,
    private router: Router
  ) { }

  getBuildings(): Object {
    return this.api.getBuildings().subscribe(val => this.buildings = val);
  }

  getRooms(building: any): Object {
    if (this.currBuilding != null) {
        this.currBuilding.selected = false;
    }

    building.selected = true;
    this.currBuilding = building
    console.log(building.shortname);
    this.currRoom = null;
    return this.api.getRooms(building.shortname).subscribe(val => this.rooms = val);
  }

  switchToRoom(room: any) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "building": this.currBuilding.shortname,
        "room": room.name 
      }
    };

    this.router.navigate(['/room-editor'], navigationExtras);
  }

  switchToAddRoom() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "building": this.currBuilding.shortname
      }
    }

    this.router.navigate(['/add-room'], navigationExtras);
  }

  switchToAddDevice(room: any) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "building": this.currBuilding.shortname,
        "room": room.name
      }
    };

    this.router.navigate(['/add-device'], navigationExtras);
  }
}
