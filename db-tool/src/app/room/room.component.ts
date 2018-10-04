import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Building, Room, RoomConfiguration } from '../objects';
import { ApiService } from '../services/api.service'; 
import { MatDialog } from '@angular/material';
import { ModalComponent, MessageType, Result } from '../modal/modal.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';
import { Strings } from '../services/strings.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit {
  @Input() InStepper: boolean = false;
  @Input() roomExists: boolean = false;
  roomtabIndex: number = 0;

  buildingList: Building[] = [];
  roomList: Room[] = [];
  @Input() addBuilding: Building;
  @Input() editBuilding: Building;
  @Input() addRoom: Room;
  @Input() editRoom: Room;

  IDToUpdate: string;

  configurationList: RoomConfiguration[] = [];
  configNameList: string[] = [];
  designationList: string[] = [];

  @ViewChild("roomtabs") roomtabs;
  
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private api: ApiService, public dialog: MatDialog, public S: Strings) { }

  ngOnInit() {
    this.addBuilding = new Building();
    this.editBuilding = new Building();
    this.addRoom = new Room();
    this.editRoom = new Room();

    this.GetBuildingList();
    this.GetConfigurationList();
    this.GetDesignationList();
  }

  ngOnChanges() {
    setTimeout(() => {
      if(this.InStepper && this.roomExists) {
        this.roomtabIndex = 1;
      }
      else {
        this.roomtabIndex = 0;
      }
    }, 0); 

    this.configurationList.forEach(c => {
      if(this.addRoom != null && c._id == "Default") {
        this.addRoom.configuration = c;
      }
    });

    this.FixMissingName();
  }

  // FixMissingName fills in the name with the ID. This helps in room creation, and in room editing since some rooms have a missing name but cannot be updated without a name.
  FixMissingName() {
    if(this.addRoom != null && this.addRoom._id != null && (this.addRoom.name == null || this.addRoom.name.length == 0)) {
      this.addRoom.name = this.addRoom._id;
    }
    if(this.editRoom != null && this.editRoom._id != null && (this.editRoom.name == null || this.editRoom.name.length == 0)) {
      this.editRoom.name = this.editRoom._id;
    }
  }

  // UpdateConfiguration picks the configuration from the list because for whatever reason ngModel has issues with the ID and stuff.
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

  ///// GETTERS & SETTERS /////
  GetBuildingList() {
    this.buildingList = [];
    this.api.GetBuildingList().subscribe(val => {
      this.buildingList = val;
    });
  }

  GetRoomList(add: boolean) {
    this.roomList = [];

    if (add) {
      this.addRoom._id = this.addBuilding._id + "-"
    }

    this.api.GetRoomList(this.editBuilding._id).subscribe(val => {
      this.roomList = val;
    });
  }

  GetConfigurationList() {
    this.configurationList = [];
    this.configNameList = [];

    this.api.GetRoomConfigurations().subscribe(val => {
      this.configurationList = val;
      this.configurationList.forEach(c => {
        if(this.addRoom != null && c._id == "Default") {
          this.addRoom.configuration = c;
        }
        this.configNameList.push(c._id)
      });
    });
  }

  GetDesignationList() {
    this.designationList = [];
    this.api.GetRoomDesignations().subscribe(val => {
      this.designationList = val;
    })
  }
  /*-*/

  ///// DATABASE SUBMISSION /////
  CreateRoom() {
    console.log(this.addRoom);
    let res: Result[] = [];
    this.api.AddRoom(this.addRoom).subscribe(
      success => {
        res.push({message: this.addRoom._id + " was successfully added.", success: true });
        this.openDialog(MessageType.Success, "Room Added", null, res);
        this.api.WriteTempChanges();
      },
      error => {
        let errorMessage = this.S.ErrorCodeMessages[error.status]

        res.push({message: error.json(), success: false, error: error});
        this.openDialog(MessageType.Error, errorMessage, null, res);
      });
  }

  UpdateRoom() {
    console.log(this.editRoom);
    let res: Result[] = [];
    this.api.UpdateRoom(this.IDToUpdate, this.editRoom).subscribe(
      success => {
        res.push({message: this.editRoom._id + " was successfully updated.", success: true });
        this.openDialog(MessageType.Success, "Room Updated", null, res);
        this.IDToUpdate = this.editRoom._id;
        this.api.WriteTempChanges();
      },
      error => {
        let errorMessage = this.S.ErrorCodeMessages[error.status]

        res.push({message: error.json(), success: false, error: error});
        this.openDialog(MessageType.Error, errorMessage, null, res);
      });
  }
  /*-*/

  ///// RESPONSE MESSAGE /////
  openDialog(status: MessageType, subheader: string, message?: string, results?: Result[]) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {type: status, subheader: subheader, message: message, results: results}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  /*-*/

  ///// TAGS /////
  AddChip(event: MatChipInputEvent, add: boolean): void {
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

  RemoveChip(tag: string, add: boolean): void {
    
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
  /*-*/
}
