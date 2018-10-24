import { Component, OnInit, Input, ViewChildren, QueryList, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Room, Device, Template, RoomConfiguration, RoomSetup } from '../../objects';
import { RoomComponent } from '../../components/room/room.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-roomlist',
  templateUrl: './roomlist.component.html',
  styleUrls: ['./roomlist.component.scss']
})
export class RoomlistComponent implements OnInit {
  @Input() roomList: Room[] = [];
  filteredRooms: Room[] = [];
  roomToDeviceMap: Map<string, Device[]> = new Map();
  templateList: Template[] = [];
  buildingID: string;

  searchQuery: string;

  constructor(private route: ActivatedRoute, private api: ApiService, private M: ModalService) {
      this.route.params.subscribe(params => {
        this.GetRoomList(params["buildingID"]);
        this.buildingID = params["buildingID"];
      });
  }

  ngOnInit() {
  }

  Search() {
    this.filteredRooms = [];

    if(this.searchQuery == null || this.searchQuery.length == 0) {
      this.filteredRooms = this.roomList;
      return;
    }

    this.roomList.forEach(room => {
      if(room._id.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredRooms.includes(room)) {
        this.filteredRooms.push(room);
      }

      if(room.name.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredRooms.includes(room)) {
        this.filteredRooms.push(room);
      }

      if(room.description.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredRooms.includes(room)) {
        this.filteredRooms.push(room);
      }

      if(room.designation.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredRooms.includes(room)) {
        this.filteredRooms.push(room);
      }

      if(room.configuration._id.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredRooms.includes(room)) {
        this.filteredRooms.push(room);
      }

      if(room.tags != null) {
        room.tags.forEach(tag => {
          if(tag.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredRooms.includes(room)) {
            this.filteredRooms.push(room);
          }
        });
      }

      if(this.roomToDeviceMap.get(room._id) != null) {
        this.roomToDeviceMap.get(room._id).forEach(device => {
          if(device.type._id.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredRooms.includes(room)) {
            this.filteredRooms.push(room);
          }
  
          if(device.tags != null) {
            device.tags.forEach(tag => {
              if(tag.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredRooms.includes(room)) {
                this.filteredRooms.push(room);
              }
            });
          }
        });
      }
    });
  }

  CreateNewRoom() {
    let newRoom = new Room();
    newRoom._id = this.buildingID + "-";
    newRoom.name = newRoom._id;
    newRoom.description = "";
    newRoom.tags = [];
    newRoom.designation = "production";
    newRoom.configuration = new RoomConfiguration();
    newRoom.configuration._id = "Default";

    this.roomList.push(newRoom);

    this.M.OpenRoomModal(newRoom);
  }

  ///// API FUNCTIONS /////
  GetRoomList(buildingID: string) {
    this.api.GetRoomList(buildingID).subscribe(val => {
      if(val != null) {
        this.roomList = val;
        this.filteredRooms = val;
        console.log(this.roomList);
        this.BuildRoomToDeviceMap();
      }
    });
  }

  BuildRoomToDeviceMap() {
    if(this.roomList == null) {
      return;
    }

    this.roomToDeviceMap = new Map();

    this.roomList.forEach(room => {
      this.api.GetDeviceList(room._id).subscribe(val => {
        if(val != null) {
          this.roomToDeviceMap.set(room._id, val);
        }
      });
    });
  }
}
