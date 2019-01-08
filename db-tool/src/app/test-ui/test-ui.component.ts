import { Component, OnInit } from '@angular/core';
import { Building, Room } from '../objects';
import { SocketService, Event } from '../socket.service';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-api-ui',
  templateUrl: './test-ui.component.html',
  styleUrls: ['./test-ui.component.scss']
})
export class TestUIComponent implements OnInit {
  building: Building = new Building();
  room: Room = new Room();
  buildingList: Building[] = [];
  roomList: Room[] = [];

  message: string;
  events: string[] = [];

  oldSub: string;
  newSub: string;

  constructor(private api: ApiService, private socket: SocketService) {
    this.UpdateFromEvents();
  }

  ngOnInit() {
    this.GetBuildings();
  }

  GetBuildings() {
    this.api.GetBuildingList().subscribe(val => {
      if(val != null) {
        this.buildingList = val;
      }
    });
  }

  GetRoomList() {
    this.api.GetRoomList(this.building._id).subscribe(val => {
      if(val != null) {
        this.roomList = val;
      }
    });
  }

  GetState() {
    let roomSplit = this.room._id.split("-")
    this.api.GetState(roomSplit[0], roomSplit[1]).subscribe(val => {
      
      this.message = JSON.stringify(val, null, 2);
    });
  }

  SetState() {
    let roomSplit = this.room._id.split("-")
    this.api.SetState(roomSplit[0], roomSplit[1], this.message).subscribe(val => {
      this.message = JSON.stringify(val, null, 3);
    });
  }

  UpdateFromEvents() {
    this.socket.getEventListener().subscribe(event => {
      if(event != null && event.data != null) {
        let e = event.data;

        this.events.push(JSON.stringify(e, null, 3));
      }
    })
  }

  UpdateRoomSubscription() {
    if(this.room._id == null) {
      return;
    }

    this.newSub = this.room._id;

    if(this.oldSub != null) {
      let r = this.oldSub.split("-");
      this.api.UnsubscribeToRoom(r[0], r[1]).subscribe(() => {
        this.events = [];
      });
    }

    if(this.newSub != null) {
      let r = this.newSub.split("-");
      this.api.SubscribeToRoom(r[0], r[1]).subscribe(() => {
        this.oldSub = this.newSub;
        this.events = [];
      });
    }
  }
}
