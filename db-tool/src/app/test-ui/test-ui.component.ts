import { Component, OnInit } from '@angular/core';
import { TestApiService } from '../test-api.service';
import { Building, Room } from '../objects';

@Component({
  selector: 'app-test-ui',
  templateUrl: './test-ui.component.html',
  styleUrls: ['./test-ui.component.scss']
})
export class TestUIComponent implements OnInit {
  building: Building = new Building();
  room: Room = new Room();
  buildingList: Building[] = [];
  roomList: Room[] = [];

  message: string;

  constructor(private test: TestApiService) { }

  ngOnInit() {
    this.GetBuildings();
  }

  GetBuildings() {
    this.test.GetBuildingList().subscribe(val => {
      if(val != null) {
        this.buildingList = val;
      }
    });
  }

  GetRoomList() {
    this.test.GetRoomList(this.building._id).subscribe(val => {
      if(val != null) {
        this.roomList = val;
      }
    });
  }

  GetState() {
    let roomSplit = this.room._id.split("-")
    this.test.GetState(roomSplit[0], roomSplit[1]).subscribe(val => {
      
      this.message = JSON.stringify(val, null, 2);
    });
  }

  SetState() {
    let roomSplit = this.room._id.split("-")
    this.test.SetState(roomSplit[0], roomSplit[1], this.message).subscribe(val => {
      this.message = JSON.stringify(val, null, 3);
    });
  }
}
