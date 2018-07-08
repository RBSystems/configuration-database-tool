import { Component, OnInit, Input } from '@angular/core';
import { Building, Room, RoomConfiguration } from '../objects';
import { ApiService } from '../api.service'; 
import { MatDialog } from '@angular/material';
import { ModalComponent } from '../modal/modal.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  @Input() InStepper: boolean = false;
  @Input() roomExists: boolean = false;
  tagList: string[] = ["Red", "Yellow", "Blue"];
  tags: string[] = [];
  buildingList: Building[] = [];
  roomList: Room[] = [];
  addBuilding: Building;
  @Input() editBuilding: Building;
  addRoom: Room;
  @Input() editRoom: Room;
  configurationList: RoomConfiguration[] = [];
  configNameList: string[] = [];
  designationList: string[] = [];
  tabIndex: number = 0;

  message: string;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private api: ApiService, public dialog: MatDialog) { }

  ngOnInit() {
    this.tabIndex = 0;
    this.addBuilding = new Building();
    this.editBuilding = new Building();
    this.addRoom = new Room();
    this.editRoom = new Room();
    this.getBuildingList();
    this.getConfigurationList();
    this.getDesignationList();
  }

  ngOnChanges() {
    if(this.InStepper && this.roomExists) {
      this.tabIndex = 1;
    }
    else {
      this.tabIndex = 0;
    }
  }

  getBuildingList() {
    this.buildingList = [];
    this.api.GetBuildingList().subscribe(val => {
      this.buildingList = val;
    });
  }

  getRoomList() {
    this.roomList = [];
    this.api.GetRoomList(this.editBuilding._id).subscribe(val => {
      this.roomList = val;
    });
  }

  getConfigurationList() {
    this.configurationList = [];
    this.configNameList = [];
    this.api.GetRoomConfigurations().subscribe(val => {
      this.configurationList = val;
      this.configurationList.forEach(c => {
        this.configNameList.push(c._id)
      });
    });
  }

  getDesignationList() {
    this.designationList = [];
    this.api.GetRoomDesignations().subscribe(val => {
      this.designationList = val;
    })
  }

  UpdateID() {
    if(this.addRoom._id == null || !this.addRoom._id.includes(this.addBuilding._id)) {
      this.addRoom._id = this.addBuilding._id + "-";
    }
  }

  UpdateConfiguration() {
    this.configurationList.forEach(c => {
      if(this.editRoom.configuration._id = c._id) {
        this.editRoom.configuration = c;
      }
      if(this.addRoom.configuration._id = c._id) {
        this.addRoom.configuration = c;
      }
    });
  }

  CreateRoom() {
    console.log(this.addRoom);
    this.api.AddRoom(this.addRoom).subscribe(
      success => {
        this.openDialog(false, "Successfully added the room!");
      },
      error => {
        this.openDialog(true, error);
      });
  }

  UpdateRoom() {
    console.log(this.editRoom);
    this.api.UpdateRoom(this.editRoom).subscribe(
      success => {
        this.openDialog(false, "Successfully updated the room!");
      },
      error => {
        this.openDialog(true, error);
      });
  }

  openDialog(status: boolean, message: string) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {error: status, message: message}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  add(event: MatChipInputEvent, add: boolean): void {
    if(add && (this.addRoom.tags == null || this.addRoom.tags.length == 0)) {
      this.addRoom.tags = [];
    }
    if(!add && (this.editRoom.tags == null || this.editRoom.tags.length == 0)) {
      this.editRoom.tags = [];
    }
    
    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim() && add) {
      this.addRoom.tags.push(value.trim());
    }
    else if ((value || '').trim() && !add) {
      this.editRoom.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(tag: string, add: boolean): void {
    
    if(add) {
      let index_A = this.addRoom.tags.indexOf(tag);
      if (index_A >= 0) {
        this.addRoom.tags.splice(index_A, 1);
      }
    }
    else {
      let index_E = this.editRoom.tags.indexOf(tag);
      if (index_E >= 0) {
        this.editRoom.tags.splice(index_E, 1);
      }
    }
  }
}
