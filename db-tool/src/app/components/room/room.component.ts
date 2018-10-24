import { Component, OnInit, Input } from '@angular/core';
import { Room, Device, RoomSetup } from '../../objects';
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material';
import { Strings } from '../../services/strings.service';
import { RoomModalComponent } from '../../modals/roommodal/roommodal.component';
import { Defaults } from '../../services/defaults.service';
import { SmeeComponent } from '../smee.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  @Input() room: Room;
  @Input() roomExists: boolean = false;
  @Input() IDToUpdate: string;

  deviceList: Device[] = [];
  okDevices: Device[] = [];
  alertingDevices: Device[] = [];

  constructor(private api: ApiService, public M: ModalService, public S: Strings, public D: Defaults) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if(this.room != null && this.roomExists) {
      this.IDToUpdate = this.room._id;
      this.GetDeviceList();
    }
  }

  IsADisplay(device: Device): boolean {
    let IsADisplay: boolean = false;
    device.roles.forEach(role => {
      if(role._id === "VideoOut") {
        IsADisplay = true;
      }
    });
    return IsADisplay;
  }


  ///// API FUNCTIONS /////
  GetDeviceList() {
    this.api.GetDeviceList(this.room._id).subscribe(val => {
      if(val != null) {
        this.deviceList = val;
      }
    });
  }

  ///// RESPONSE MESSAGE /////
  // openDialog opens a modal from the Modal Component.
  OpenRoomModal() {
    this.M.OpenRoomModal(this.room, this.roomExists);
  }
  /*-*/
}
