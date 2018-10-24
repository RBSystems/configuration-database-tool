import { Component, OnInit, Input, Inject, forwardRef } from '@angular/core';
import { Building, Room } from '../../objects'
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material';

import { Strings } from '../../services/strings.service';
import { BuildingModalComponent } from '../../modals/buildingmodal/buildingmodal.component';
import { HomeComponent } from '../../pages/home/home.component';
import { SmeeComponent } from '../smee.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent implements OnInit, SmeeComponent{
  @Input() data;
  @Input() building: Building;
  @Input() buildingExists: boolean = false;
  @Input() IDToUpdate: string;

  roomList: Room[] = [];
  okRooms: Room[] = [];
  errorRooms: Room[] = [];

  constructor(private api: ApiService, public M: ModalService, public S: Strings, @Inject(forwardRef(() => HomeComponent)) public _parent:HomeComponent) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if(this.building != null && this.buildingExists) {
      this.IDToUpdate = this.building._id;
      this.GetRoomList();
    }
  }

  GetImage(): string {
    return "../../assets/images/" + this.building._id + ".jpg"
  }

  ///// API FUNCTIONS /////
  GetRoomList() {
    this.api.GetRoomList(this.building._id).subscribe(val => {
      if(val != null) {
        this.roomList = val;
      }
    });
  }

  ///// RESPONSE MESSAGE /////
  // openDialog opens a modal from the Modal Component.
  OpenBuildingModal() {
    this.M.OpenBuildingModal(this.building);
  }
  /*-*/
}
