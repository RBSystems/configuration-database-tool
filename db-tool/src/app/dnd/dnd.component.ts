import { Component, OnInit, Input  } from '@angular/core';
import { Building, Room, Device, DeviceType, Role, Port, Group, RoomConfiguration } from '../objects';
import { MatDialog, ErrorStateMatcher } from '@angular/material';
import { ModalComponent, MessageType, Result } from '../modal/modal.component';
import { ApiService } from '../services/api.service'; 
import { Strings } from '../services/strings.service';
import { Defaults } from '../services/defaults.service';

@Component({
  selector: 'app-dnd',
  templateUrl: './dnd.component.html',
  styleUrls: ['./dnd.component.scss']
})
export class DndComponent implements OnInit {
  location: string;
  building: Building;
  room: Room;

  newBuilding: boolean = true;
  newRoom: boolean = true;

  buildingList: Building[];
  allRoomList: Room[];

  configurationList: RoomConfiguration[] = [];
  configurationMap: Map<string, RoomConfiguration> = new Map();

  @Input() deviceTypeList: DeviceType[] = [];
  @Input() deviceTypeMap: Map<string, DeviceType> = new Map();

  groupList: Group[] = [];

  devicesToAdd: Device[] = [];

  constructor(private api: ApiService, public dialog: MatDialog, public S: Strings, public D: Defaults) { }

  ngOnInit() {
    this.GetDeviceTypeList();
    this.getBuildingList();
    this.getAllRooms();
  }

  ValidateLocation() {
    // Check to see if the building already exists or not.
    let buildingID = this.location.toUpperCase().split("-")[0];
    this.buildingList.forEach(b => {
      if(b._id === buildingID) {
        this.building = b;
        this.newBuilding = false;
      }
    });

    if(this.building == null) {
      this.building = new Building();
      this.building._id = buildingID;
    }

    this.allRoomList.forEach(r => {
      if(r._id === this.location.toUpperCase()) {
        this.newRoom = false;
      }
    });

    if(this.newRoom) {
      this.room = new Room();
      this.room._id = this.location.toUpperCase();
      this.room.name = this.room._id;
      this.room.designation = "production";
      this.room.configuration = this.configurationMap.get("Default");

    }
    else if(!this.newRoom) {
      
      let header: string = this.location.toUpperCase() + " already exists.";
      let information: string = "Please add or modify the information you need for that room in the individual building, room, and device pages."
      this.openDialog(MessageType.Info, header, information)
      return;
    }
  }

  CreateNewDevice(baseType: DeviceType): Device {
    return new Device(baseType);
  }

  AddGroup(): Group {
    let g = new Group();
    this.groupList.push(g);
    return g;
  }

  AddDeviceToGroup(group: Group, dev: Device) {
    if(dev.name == null) {
      dev.name = this.D.DefaultDeviceNames[dev.type._id];
      this.AssignDeviceNumber(dev);
      dev._id = this.room._id + "-" + dev.name;
      dev.address = dev._id + ".byu.edu";
      this.devicesToAdd.push(dev);
    }
    group.devices.push(dev);
    group.devices = group.devices.sort(this.sortAlphaNum);
    
  }

  RemoveFromGroup(group: Group, dev: Device) {
    let index = group.devices.indexOf(dev);
    delete group.devices[index];
    group.devices = group.devices.filter(this.notEmpty).sort(this.sortAlphaNum);
  }

  DeleteDevice(dev: Device) {
    let index = this.devicesToAdd.indexOf(dev);
    delete this.devicesToAdd[index];
    this.devicesToAdd = this.devicesToAdd.filter(this.notEmpty).sort(this.sortAlphaNum);
  }

  DeleteGroup(group: Group) {
    // Delete each device
    group.devices.forEach(d => {
      this.DeleteDevice(d);
    });

    // TODO Delete the preset information here

    // Delete the group.
    let index = this.groupList.indexOf(group);
    delete this.groupList[index];
    this.groupList = this.groupList.filter(this.notEmpty);
  }

  SetValidDropZones(dev: Device): string[] {
    if(this.TypeHasRole(this.deviceTypeMap.get(dev.type._id), "ControlProcessor")) {
      return ['Pi', 'NotPi'];
    }
    else {
      return ['NotPi'];
    }
  }

  AssignDeviceNumber(device: Device) {
    let sameNames: Device[] = [];
    this.devicesToAdd.forEach(d => {
      if(d.name.includes(device.name)) {
        sameNames.push(d);
      }
    });

    if(sameNames.length === 0) {
      device.name = device.name + "1";
    }
    else {
      let last = sameNames[sameNames.length-1];
      let NumRegex = /[0-9]/;
      let index = last.name.search(NumRegex)
      let lastNumber: string = last.name.substring(index);
      let devNumber = parseInt(lastNumber)+1;
      device.name = device.name + devNumber;
    }
  }

  TypeHasRole(dType: DeviceType, roleID: string): boolean {
    if(dType.roles != null && dType.roles.length > 0) {
        let found: boolean = false;
        dType.roles.forEach(r => {
            if(r._id === roleID) {
                found = true;
            }
        });
        return found;
    }
  }

  ///// API FUNCTIONS /////
  GetDeviceTypeList() {
    this.deviceTypeList = [];
    this.api.GetDeviceTypesList().subscribe(val => {
      this.deviceTypeList = val;

      this.deviceTypeList.forEach(type => {
        this.deviceTypeMap.set(type._id, type);
      })
    });
  }

  getBuildingList() {
    this.buildingList = [];
    this.api.GetBuildingList().subscribe(val => {
      this.buildingList = val;
    });
  }

  getAllRooms() {
    this.allRoomList = [];
    this.api.GetAllRooms().subscribe(val => {
      this.allRoomList = val;
    });
  }

  GetConfigurationList() {
    this.configurationList = [];
    this.configurationMap = new Map();

    this.api.GetRoomConfigurations().subscribe(val => {
      this.configurationList = val;
      this.configurationList.forEach(c => {
        this.configurationMap.set(c._id, c);
      });
    });
  }

  openDialog(status: MessageType, subheader: string, message?: string, results?: Result[]) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {type: status, subheader: subheader, message: message, results: results}
    });

    dialogRef.afterClosed().subscribe(result => {
      
    });
  }

  notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    // Remove all empty and null values from the array.
    return value !== null && value !== undefined;
  }

  sortAlphaNum(a: Device,b: Device) {
    // Sort the array first alphabetically and then numerically.
    let reA: RegExp = /[^a-zA-Z]/g;
    let reN: RegExp = /[^0-9]/g;
    
    let aA = a._id.replace(reA, "");
    let bA = b._id.replace(reA, "");

    if(aA === bA) {
        let aN = parseInt(a._id.replace(reN, ""), 10);
        let bN = parseInt(b._id.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
  }
}
