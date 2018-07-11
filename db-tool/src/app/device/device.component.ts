import { Component, OnInit, Input } from '@angular/core';
import { Building, Room, Device, DeviceType, Role } from '../objects';
import { ApiService } from '../api.service'; 
import { MatDialog } from '@angular/material';
import { ModalComponent } from '../modal/modal.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit {
  @Input() InStepper: boolean = false;

  @Input() addBuilding: Building;
  @Input() editBuilding: Building;
  @Input() addRoom: Room;
  @Input() editRoom: Room;
  @Input() addDevice: Device;
  @Input() editDevice: Device;
  @Input() addType: DeviceType;
  editType: DeviceType;

  addBuildingList: Building[] = [];
  editBuildingList: Building[] = [];
  editRoomList: Room[] = [];
  addRoomList: Room[] = [];
  addDeviceList: Device[] = [];
  editDeviceList: Device[] = [];
  addSourceDevices: Device[] = [];
  editSourceDevices: Device[] = [];
  addDestinationDevices: Device[] = [];
  editDestinationDevices: Device[] = [];
  @Input() deviceTypeList: DeviceType[] = [];
  deviceRoleList: Role[] = [];
  addRoleList: Role[] = [];
  editRoleList: Role[] = [];
  switcherTypes: string[] = ["Blu50", "Kramer VS-44DT", "DM-MD16x16", "PulseEight8x8", "ShureULXD"]

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private api: ApiService, public dialog: MatDialog) {}

  ngOnInit() {
    
    this.getAddBuildingList();
    this.getEditBuildingList();

    if(!this.InStepper) {
      this.getDeviceRoleList();
      this.getDeviceTypeList();

      this.addBuilding = new Building();
      this.addRoom = new Room();
      this.addDevice = new Device();
    }

    this.editBuilding = new Building();
    this.editRoom = new Room();
    
    this.addDevice.type = new DeviceType();
    this.editDevice = new Device();
    this.editDevice.type = new DeviceType();
    
  }

  ngOnChanges() {
    // console.log(this.addDevice);
    this.getDeviceRoleList();
    
    // console.log(this.addDevice.type);
    // console.log(this.addDevice.type._id);
    // console.log(this.addType);
    this.UpdateDeviceTypeInfo();
  }

  getAddBuildingList() {
    if(!this.InStepper) {
      this.addBuilding = new Building();
      this.addRoom = new Room();
      this.addDevice = new Device();
      this.addDevice.type = new DeviceType();
      this.UpdateDeviceTypeInfo();
    }

    this.addBuildingList = [];

    this.api.GetBuildingList().subscribe(val => {
      this.addBuildingList = val;
    });
  }

  getEditBuildingList() {
    this.editBuilding = new Building();
    this.editRoom = new Room();
    this.editDevice = new Device();
    this.editDevice.type = new DeviceType();

    this.editBuildingList = [];

    this.api.GetBuildingList().subscribe(val => {
      this.editBuildingList = val;
    });
  }

  getAddRoomList() {
    if(!this.InStepper) {
      this.addRoom = new Room();
      this.addDevice = new Device();
      this.addDevice.type = new DeviceType();
    }

    this.addRoomList = [];

    this.api.GetRoomList(this.addBuilding._id).subscribe(val => {
      this.addRoomList = val;
    });
  }

  getEditRoomList() {
    this.editRoom = new Room();
    this.editDevice = new Device();
    this.editDevice.type = new DeviceType();

    this.editRoomList = [];

    this.api.GetRoomList(this.editBuilding._id).subscribe(val => {
      this.editRoomList = val;
    });
  }

  getAddDeviceList() {
    if(!this.InStepper) {
      this.addDevice = new Device();
      this.addDevice.type = new DeviceType();
    }

    if(this.addDevice != null) {
      this.addDevice._id = this.addRoom._id + "-";
    }    

    this.UpdateRoleLists(true);

    this.addDeviceList = [];
    this.addSourceDevices = [];

    this.api.GetDeviceList(this.addRoom._id).subscribe(val => {
      this.addDeviceList = val;
      this.addDeviceList.forEach(d => {
        this.deviceTypeList.forEach(t => {
          if(d.type._id == t._id && (t.input || this.switcherTypes.includes(t._id))) {
            this.addSourceDevices.push(d);
          }
          if(d.type._id == t._id && (t.output || this.switcherTypes.includes(t._id))) {
            this.addDestinationDevices.push(d);
          }
        });
      });
    });
  }

  getEditDeviceList() {
    this.editDevice = new Device();
    this.editDevice.type = new DeviceType();

    this.editDeviceList = [];
    this.editSourceDevices = [];

    this.api.GetDeviceList(this.editRoom._id).subscribe(val => {
      this.editDeviceList = val;
      this.editDeviceList.forEach(d => {
        this.deviceTypeList.forEach(t => {
          if(d.type._id == t._id && (t.input || this.switcherTypes.includes(t._id))) {
            this.editSourceDevices.push(d);
          }
          if(d.type._id == t._id && (t.output || this.switcherTypes.includes(t._id))) {
            this.editDestinationDevices.push(d);
          }
        });
      });
    });
  }

  getDeviceTypeList() {
    this.deviceTypeList = [];
    this.api.GetDeviceTypesList().subscribe(val => {
      this.deviceTypeList = val;
    });
  }

  getDeviceRoleList() {
    this.deviceRoleList = [];
    this.api.GetDeviceRolesList().subscribe(val => {
      let tempList: string[] = val;
      tempList.forEach(r => {
        let role = new Role();
        role._id = r;
        role.description = r;
        role.tags = [];
        this.deviceRoleList.push(role);
      });    
      this.UpdateRoleLists(true);
    });
  }

  UpdateID() {
    if(this.addRoom._id == null || !this.addRoom._id.includes(this.addBuilding._id)) {
      this.addRoom._id = this.addBuilding._id + "-";
    }
  }

  UpdateRoleLists(add: boolean) {
    if(add) {
      this.addRoleList = [];
      this.deviceRoleList.forEach(role => {
        let PushToAddList : boolean = true;
        this.addDevice.roles.forEach(dRole => {
          if(role._id == dRole._id) {
            PushToAddList = false;
          }
        });
        if(PushToAddList) {
          this.addRoleList.push(role);
        }
      });
    }
    else {
      this.editRoleList = [];
      this.deviceRoleList.forEach(role => {
        let PushToEditList : boolean = true;
        this.editDevice.roles.forEach(dRole => {
          if(role._id == dRole._id) {
            PushToEditList = false;
          }
        });
        if(PushToEditList) {
          this.editRoleList.push(role);
        }
      });
    }
  }

  UpdateDeviceTypeInfo() {
    this.deviceTypeList.forEach(type => {
      if(this.addDevice != null && type._id == this.addDevice.type._id) {
        this.addDevice.ports = type.ports;
        this.addType = type;

        if(this.addDevice.type._id == "non-controllable") {
          this.addDevice.address = "0.0.0.0";
        }

        this.UpdateDevicePorts(true);
      }
      if(this.editDevice != null && type._id == this.editDevice.type._id) {
        this.editType = type;
        
        this.UpdateDevicePorts(false);
      }
    });
  }

  UpdateDevicePorts(add : boolean) {
    if(add) {
      let tempDevicePorts = this.addDevice.ports;
      this.addDevice.ports = [];

      this.addType.ports.forEach(typePort => {
        let PushToAddPorts: boolean = true;
      
        tempDevicePorts.forEach(devPort => {
          if(typePort._id == devPort._id) {
            PushToAddPorts = false;
            this.addDevice.ports.push(devPort);
          }
        });
      
        if(PushToAddPorts) {
          this.addDevice.ports.push(typePort);
        }
      });
    }
    else if(!add) {
      let tempDevicePorts = this.editDevice.ports;
      this.editDevice.ports = [];

      this.editType.ports.forEach(typePort => {
        let PushToEditPorts: boolean = true;
      
        tempDevicePorts.forEach(devPort => {
          if(typePort._id == devPort._id) {
            PushToEditPorts = false;
            this.editDevice.ports.push(devPort);
          }
        });
      
        if(PushToEditPorts) {
          this.editDevice.ports.push(typePort);
        }
      });
    }
  }

  CreateDevice() {
    console.log(this.addDevice);
    this.api.AddDevice(this.addDevice).subscribe(
      success => {
        this.openDialog(false, "Successfully added the device!");
      },
      error => {
        this.openDialog(true, error);
      });
  }

  UpdateDevice() {
    console.log(this.editDevice);
    this.editDevice.type = new DeviceType();
    this.editDevice.type._id = this.editType._id;
    console.log(this.editDevice);
    this.api.UpdateDevice(this.editDevice).subscribe(
      success => {
        this.openDialog(false, "Successfully updated the device!");
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

  AddChip(event: MatChipInputEvent, add: boolean): void {
    if(add && (this.addDevice.tags == null || this.addDevice.tags.length == 0)) {
      this.addDevice.tags = [];
    }
    if(!add && (this.editDevice.tags == null || this.editDevice.tags.length == 0)) {
      this.editDevice.tags = [];
    }

    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim() && add) {
      this.addDevice.tags.push(value.trim());
    }
    else if ((value || '').trim() && !add) {
      this.editDevice.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  RemoveChip(tag: string, add: boolean): void {
    
    if(add) {
      let index_A = this.addDevice.tags.indexOf(tag);
      if (index_A >= 0) {
        this.addDevice.tags.splice(index_A, 1);
      }
    }
    else {
      let index_E = this.editDevice.tags.indexOf(tag);
      if (index_E >= 0) {
        this.editDevice.tags.splice(index_E, 1);
      }
    }
  }
}
