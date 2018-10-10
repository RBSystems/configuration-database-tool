import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Room, Device } from '../../objects';
import { ApiService } from '../../services/api.service';
import { Strings } from '../../services/strings.service';

@Component({
  selector: 'app-roomdetail',
  templateUrl: './roomdetail.component.html',
  styleUrls: ['./roomdetail.component.scss']
})
export class RoomDetailComponent implements OnInit {
  room: Room;
  roomID: string;
  deviceList: Device[] = [];

  constructor(private api: ApiService, public S: Strings, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.GetDeviceList(params["roomID"]);
      this.roomID = params["roomID"];
    });
  }

  ngOnInit() {
  }

  ///// API FUNCTIONS /////
  GetDeviceList(roomID: string) {
    this.api.GetDeviceList(roomID).subscribe(val => {
      if(val != null) {
        this.deviceList = val;
      }
    });
  }
}
