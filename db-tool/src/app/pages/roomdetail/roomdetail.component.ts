import { Component, OnInit, ViewChild, ComponentFactoryResolver, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Room, Device, RoomSetup } from '../../objects';
import { ApiService } from '../../services/api.service';
import { Strings } from '../../services/strings.service';
import { DetailDirective } from '../../detail.directive';
import { RoomModalComponent } from '../../modals/roommodal/roommodal.component';
import { HomeComponent } from '../home/home.component';
import { ComponentsService } from '../../services/components.service';
import { SmeeComponent } from '../../components/smee.component';

@Component({
  selector: 'app-roomdetail',
  templateUrl: './roomdetail.component.html',
  styleUrls: ['./roomdetail.component.scss']
})
export class RoomDetailComponent implements OnInit, SmeeComponent {
  @Input() data: RoomSetup;
  room: Room;
  roomID: string;
  deviceList: Device[] = [];

  @ViewChild(DetailDirective) detail: DetailDirective;

  constructor(private api: ApiService, public S: Strings, private route: ActivatedRoute, private resolver: ComponentFactoryResolver, private Comp: ComponentsService) {
    this.route.params.subscribe(params => {
      this.GetDeviceList(params["roomID"]);
      this.roomID = params["roomID"];
      this.GetRoom(this.roomID);
    });
  }

  ngOnInit() {
  }

  loadComponent(action: string, data: any) {
    let item = this.Comp.getCompItem(action, data)
    let componentFactory = this.resolver.resolveComponentFactory(item.component);
    let viewContainerRef = this.detail.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<SmeeComponent>componentRef.instance).data = item.data;
  }

  ///// API FUNCTIONS /////
  GetDeviceList(roomID: string) {
    this.api.GetDeviceList(roomID).subscribe(val => {
      if(val != null) {
        this.deviceList = val;
      }
    });
  }

  GetRoom(roomID: string) {
    this.api.GetRoomByID(roomID).subscribe(val => {
      if(val != null) {
        this.room = val;
        this.loadComponent(this.S.ActionList[0], this.room);
      }
    });
  }
}
