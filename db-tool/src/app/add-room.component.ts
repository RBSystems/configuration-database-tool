import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { APIService } from './api.service';
import { Room } from './objects';

@Component({
  selector: 'add-room',
  templateUrl: './add-room.component.html',
  providers: [APIService],
})

export class AddRoomComponent implements OnInit {
  toadd: Room;

  currBuilding: string;
  roomConfigs: any;

  constructor(
    private api: APIService,
    private route: ActivatedRoute,
    private Location: Location
  ) {
    this.route.queryParams.subscribe(params => {
      this.currBuilding = params["building"];
    })
  }

  ngOnInit(): void {
    this.api.getRoomConfigs().subscribe(val => this.roomConfigs = val);

    this.toadd = {
      name: "",
      description: "",
      configurationID: null,
      roomDesignation: "production"
    }
  }

  postData() {
    this.toadd.configurationID = Number(this.toadd.configurationID)

    this.api.postData("/buildings/" + this.currBuilding + "/rooms/" + this.toadd.name, this.toadd)
      .subscribe(
      data => {
        //refresh rooms?
        console.log("success");
        return true;
      }, error => {
        console.error("failed to post data");
        console.error(error.json());
        return Observable.throw(error);
      }
      );
  }
}
