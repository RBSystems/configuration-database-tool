import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Strings } from '../services/strings.service';
import { Building, Room, Device, UIConfig, Role, Preset } from '../objects';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  @Input() InStepper: boolean = false;
  buildingList: Building[];
  roomList: Room[];
  @Input() building: Building;
  @Input() room: Room;
  RoomToDeviceMap: Map<string, Device[]> = new Map();
  RoomToUIConfigMap: Map<string, UIConfig> = new Map();
  @Input() deviceList: Device[] = [];
  @Input() config: UIConfig = new UIConfig();
  roomStep: number = 0;

  roomColumns: string[] = ['_id', 'name', 'description', 'configuration', 'designation'];
  deviceColumns: string[] = ['_id', 'name', 'description', 'address', 'roles', 'type'];
  portColumns: string[] = ['_id', 'friendly_name', 'source_device', 'destination_device'];
  uiconfigColumns: string[] = ['panel', 'preset', 'uipath', 'main_icon', 'displays', 'inputs'];


  constructor(private api: ApiService, public S: Strings) { }

  ngOnInit() {
    this.getBuildingList();
  }

  getBuildingList() {
    this.buildingList = [];
    
    this.api.GetBuildingList().subscribe(val => {
      this.buildingList = val;
    });
  }

  getRoomList() {
    this.roomList = [];
    this.room = new Room();

    this.api.GetRoomList(this.building._id).subscribe(val => {
      this.roomList = val;
      this.setRoomToDeviceMap();
      this.setRoomToUIConfigMap();
    });
  }

  setRoomToDeviceMap() {
    this.roomList.forEach(r => {
      this.api.GetDeviceList(r._id).subscribe(val => {
        let list: Device[] = val;
        this.RoomToDeviceMap.set(r._id, list);
      });
    });
  }

  setRoomToUIConfigMap() {
    this.roomList.forEach(r => {
      this.api.GetUIConfig(r._id).subscribe(val => {
        let config: UIConfig = val;
        this.RoomToUIConfigMap.set(r._id, config);
      });
    });
  }

  getDeviceList() {
    this.deviceList = [];

    this.api.GetDeviceList(this.room._id).subscribe(val => {
      this.deviceList = val;
    });
  }

  getUIConfig() {
    this.api.GetUIConfig(this.room._id).subscribe(val => {
      this.config = val;
    });
  }

  getPreset(roomID: string, pName: string): Preset {
    let presets: Preset[];
    
    if(!this.InStepper) {
      presets = this.RoomToUIConfigMap.get(roomID).presets;
    }
    else if(this.config != null) {
      presets = this.config.presets;
    }

    for(let i = 0; i < presets.length; i++) {
      if(presets[i].name === pName) {
        return presets[i];
      }
    }
  }

  setStep(index: number) {
    this.roomStep = index;
  }

  nextStep() {
    this.roomStep++;    
  }

  prevStep() {
    this.roomStep--;
  }

  arrayToString(array: string[]) {
    if(array.length == 0) {
      return "None";
    }
    return array.join(", ");
  }

  rolesToString(rolesArray: Role[]) {
    if(rolesArray.length == 0) {
      return "None";
    }

    let roleNames: string[] = [];

    rolesArray.forEach(r => {
      roleNames.push(r._id);
    });

    return roleNames.join(", ");
  }

  Check() {
    console.log(this.building);
    console.log(this.roomList);
    console.log(this.RoomToDeviceMap);
    console.log(this.RoomToUIConfigMap);
  }
}
