import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { Building, Room, Device, DeviceType, Port, Role } from '../objects';
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
  tagList: string[] = ["Red", "Yellow", "Blue"];
  tags: string[] = [];
  addBuildingList: Building[] = [];
  editBuildingList: Building[] = [];
  editRoomList: Room[] = [];
  addRoomList: Room[] = [];
  @Input() addBuilding: Building;
  @Input() editBuilding: Building;
  @Input() addRoom: Room;
  @Input() editRoom: Room;
  @Input() addDevice: Device;
  @Input() editDevice: Device;
  addType: DeviceType;
  editType: DeviceType;
  addDeviceList: Device[] = [];
  editDeviceList: Device[] = [];
  addSourceDevices: Device[] = [];
  editSourceDevices: Device[] = [];
  addDestinationDevices: Device[] = [];
  editDestinationDevices: Device[] = [];
  deviceTypeList: DeviceType[] = [];
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
    this.getDeviceRoleList();
    this.getDeviceTypeList();
    this.getAddBuildingList();
    this.getEditBuildingList();

    if(!this.InStepper) {
      
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

    // this.getAddBuildingList();
    // this.getEditBuildingList();
    // this.getDeviceTypeList();
    // this.getDeviceRoleList();

    this.UpdateDeviceInfo();
    console.log(this.addDevice)
    
  }

  getAddBuildingList() {
    if(!this.InStepper) {
      this.addBuilding = new Building();
      this.addRoom = new Room();
      this.addDevice = new Device();
      this.addDevice.type = new DeviceType();
      this.UpdateDeviceInfo();
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
      console.log(this.deviceRoleList)    
    });
  }

  UpdateID() {
    if(this.addRoom._id == null || !this.addRoom._id.includes(this.addBuilding._id)) {
      this.addRoom._id = this.addBuilding._id + "-";
    }
  }

  UpdateDeviceInfo() {
    this.deviceTypeList.forEach(type => {
      if(type._id == this.addDevice.type._id) {
        this.addDevice.ports = type.ports;
        this.addType = type;
        console.log(this.addType)

        if(this.addType.ports != null) {
          this.addType.ports.forEach(typePort => {
            let add1: boolean = true;
          
            this.addDevice.ports.forEach(devPort => {
              if(typePort._id == devPort._id) {
                add1 = false;
              }
            });
          
            if(add1) {
              this.addDevice.ports.push(typePort);
            }
          });
        }

        this.addRoleList = [];
        this.deviceRoleList.forEach(role => {
          let add2: boolean = true;
          
          this.addDevice.roles.forEach(r => {
            if(role._id == r._id) {
              add2 = false;
            }
          });
          
          if(add2) {
            this.addRoleList.push(role);
          }
        });
      }
      if(type._id == this.editDevice.type._id) {
        this.editType = type;

        if(this.editType.ports != null) {
          this.editType.ports.forEach(typePort => {
            let add3: boolean = true;
          
            this.editDevice.ports.forEach(devPort => {
              if(typePort._id == devPort._id) {
                add3 = false;
              }
            });
          
            if(add3) {
              this.editDevice.ports.push(typePort);
            }
          });
        }

        this.editRoleList = [];
        this.deviceRoleList.forEach(role => {
          let add4: boolean = true;
          
          this.editDevice.roles.forEach(r => {
            if(role._id == r._id) {
              add4 = false;
            }
          });
          
          if(add4) {
            this.editRoleList.push(role);
          }
        });
        
        console.log(this.editType)
      }
    });
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

  add(event: MatChipInputEvent, add: boolean): void {
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

  remove(tag: string, add: boolean): void {
    
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
