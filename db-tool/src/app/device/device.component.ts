import { Component, OnInit, Input } from '@angular/core';
import { Building, Room, Device, DeviceType, Role } from '../objects';
import { ApiService } from '../api.service'; 
import { MatDialog } from '@angular/material';
import { ModalComponent, MessageType, Result } from '../modal/modal.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';
import { Strings } from '../strings.service';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
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

  IDToUpdate: string;

  addBuildingList: Building[] = [];
  editBuildingList: Building[] = [];
  editRoomList: Room[] = [];
  addRoomList: Room[] = [];
  @Input() addDeviceList: Device[] = [];
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

  constructor(private api: ApiService, public dialog: MatDialog, public S: Strings) {}

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

    if(this.addDevice.type == null) {
      this.addDevice.type = new DeviceType();
    }

    this.editBuilding = new Building();
    this.editRoom = new Room();
    
    
    this.editDevice = new Device();
    this.editDevice.type = new DeviceType();
    
  }

  ngOnChanges() {
    setTimeout(() => {
      this.GetSourceAndDestinationLists();
      this.getDeviceRoleList();
      this.UpdateDeviceTypeInfo();      
    }, 0); 
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

    this.UpdateID();  

    this.UpdateRoleLists(true);

    this.addDeviceList = [];

    this.api.GetDeviceList(this.addRoom._id).subscribe(val => {
      this.addDeviceList = val;
      this.GetSourceAndDestinationLists();
    });
  }

  getEditDeviceList() {
    this.editDevice = new Device();
    this.editDevice.type = new DeviceType();

    this.editDeviceList = [];

    this.api.GetDeviceList(this.editRoom._id).subscribe(val => {
      this.editDeviceList = val;
      this.GetSourceAndDestinationLists();
    });
  }

  GetSourceAndDestinationLists() {
    this.addSourceDevices = [];
    this.addDestinationDevices = [];

    this.editSourceDevices = [];
    this.editDestinationDevices = [];

    if(this.addDeviceList != null) {
      this.addDeviceList.forEach(d => {
        this.deviceTypeList.forEach(t => {
          if(d.type._id == t._id && t.source) {
            this.addSourceDevices.push(d);
          }
          if(d.type._id == t._id && t.destination) {
            this.addDestinationDevices.push(d);
          }
        });
      });
    }

    if(this.editDeviceList != null) {
      this.editDeviceList.forEach(d => {
        this.deviceTypeList.forEach(t => {
          if(d.type._id == t._id && t.source) {
            this.editSourceDevices.push(d);
          }
          if(d.type._id == t._id && t.destination) {
            this.editDestinationDevices.push(d);
          }
        });
      });
    }
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
      this.deviceRoleList = val;  
      this.UpdateRoleLists(true);
    });
  }

  UpdateID() {
    if(this.addDevice != null) {
      if (this.addRoom != null && this.addRoom._id != null) {
        let id = this.addRoom._id.concat("-");
        if(this.addDevice.name != null) {
          id = id + this.addDevice.name;
        }
        this.addDevice._id = id;
      }
    }

    if(this.editDevice != null) {
      if (this.editRoom != null && this.editRoom._id != null) {
        let id = this.editRoom._id.concat("-");
        if(this.editDevice.name != null) {
          id = id + this.editDevice.name;
        }
        this.editDevice._id = id;
      }
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
      if(this.addDevice != null && this.addDevice.type != null && type._id == this.addDevice.type._id) {
        this.addDevice.ports = [];
        
        if(type.ports != null) {
          this.addDevice.ports = type.ports;
        }
        
        this.addType = type;

        if(this.addDevice.type._id == "non-controllable") {
          this.addDevice.address = "0.0.0.0";
        }

        this.GetSourceAndDestinationLists();

        this.addDevice.roles = [];
        this.addDevice.roles = this.addType.roles;
        this.UpdateRoleLists(true);
        this.UpdateDevicePorts(true);
      }
      if(this.editDevice != null && type._id == this.editDevice.type._id) {
        this.editType = type;

        this.editDevice.ports = [];
        
        if(type.ports != null) {
          this.editDevice.ports = type.ports;
        }
        
        this.editDevice.roles = this.editType.roles;
        this.UpdateRoleLists(false);
        this.UpdateDevicePorts(false);
      }
    });
  }

  UpdateDevicePorts(add : boolean) {
    if(add && this.addType.ports != null) {
      console.log(this.addDevice)
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

      this.SetDefaultPortConfigurations();

    }
    else if(!add && this.editType.ports != null) {
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

  SetDefaultPortConfigurations() {
    console.log("Hello friends")
    let NumRegex = /[0-9]/;
    let IDEnd = this.addDevice._id.split("-", 3)[2];
    let index = IDEnd.search(NumRegex)
    let devNumber: string = IDEnd.substring(index);

    if(this.addDevice.ports != null) {
      let defaultPorts = this.S.DefaultPorts[this.addDevice.type._id];
      console.log(defaultPorts);

      this.addDevice.ports.forEach(port => {  
        let sourceName = defaultPorts[port._id].source;
        this.addSourceDevices.forEach(source => {
          if(source.name.includes(sourceName) && source.name.includes(devNumber)) {
            port.source_device = source._id;
          }
        });

        let destName = defaultPorts[port._id].destination;
        this.addDestinationDevices.forEach(dest => {
          if(dest.name.includes(destName) && dest.name.includes(devNumber)) {
            port.destination_device = dest._id;
          }
        });
      });
    }
    // this.addDevice.ports.forEach(port => {
    //   if(port.source_device == null) {
    //     console.log("the most hello")
    //     this.addSourceDevices.forEach(source => {
    //       console.log(port._id)
    //       console.log(this.S.DefaultPorts[this.addDevice.type._id][port._id].source)
    //       if(source.name.includes(devNumber) && source.name.includes(this.S.DefaultPorts[this.addDevice.type._id][port._id].source)) {
    //         port.source_device = source._id
    //       }
    //     });
    //   }

    //   if(port.destination_device == null && this.addType.output) {
    //     port.destination_device = this.addDevice._id
    //   }
      
    //   if(port.destination_device == null && this.switcherTypes.includes(this.addDevice.type._id)) {
    //     this.addDestinationDevices.forEach(dest => {
    //       if(dest.name.includes(devNumber) && dest.name.includes(this.S.DefaultPorts[this.addDevice.type._id][port._id].destination)) {
    //         port.destination_device = dest._id
    //       }
    //     });
    //   }
    // });
    // Set Ports for output devices (i.e. displays)
    // if(this.addType.output && this.addDevice.ports != null && this.addDevice.ports.length > 0) {
    //   this.addSourceDevices.forEach(source => {
    //     if(this.addRoom.configuration._id.includes("Tiered") || this.addRoom.configuration._id.includes("Video")) {
    //       if(source.name.includes("SW") && this.addDevice.ports.length >= 1) {
    //         this.addDevice.ports[0].source_device = source._id;
    //         for(let i = 1; i < this.addDevice.ports.length; i++) {
    //           this.addDevice.ports[i].source_device = "";
    //         }
    //       }
    //     }
    //     else {
    //       if(source.name.includes(devNumber)) {
    //         if(source.name.includes("HDMI") && this.addDevice.ports.length >= 2) {
    //           this.addDevice.ports[1].source_device = source._id;
    //         }
    //         if(source.name.includes("VIA") && this.addDevice.ports.length >= 3) {
    //           this.addDevice.ports[2].source_device = source._id;
    //         }
    //         if(source.name.includes("PC") && this.addDevice.ports.length >= 4) {
    //           this.addDevice.ports[3].source_device = source._id;
    //         }
    //       }
    //     }
    //   });

    //   this.addDevice.ports.forEach(port => {
    //     port.destination_device = this.addDevice._id;
    //   });
    // }

    // Set Ports for video switchers and DSPs
    // if(this.switcherTypes.includes(this.addDevice.type._id) && this.addDevice.ports != null && this.addDevice.ports.length > 0) {
    //   console.log(this.addDevice)
    //   this.addDevice.ports.forEach(port => {
    //     if(port._id.includes("IN")) {
          
    //       port.destination_device = this.addDevice._id;
          
    //       if(port.source_device != null) {
    //         let currentSource = port.source_device;
    //         this.addSourceDevices.forEach(source => {
    //           if(source._id.includes(currentSource)) {
    //             port.source_device = source._id;
    //           }
    //         });
    //       }
    //     }
    //     else if(port._id.includes("OUT")) {

    //       port.source_device = this.addDevice._id;

    //       if(port.destination_device != null) {
    //         let currentDestination = port.destination_device;
    //         this.addDestinationDevices.forEach(destination => {
    //           if(destination._id.includes(currentDestination)) {
    //             port.destination_device = destination._id;
    //           }
    //         });
    //       }
    //     }
    //     else {
    //       port.destination_device = this.addDevice._id;
    //     }
    //   });
    // }

    // Set Ports for gateway devices
    // if(this.addDevice.type._id == "Crestron RMC-3 Gateway") {
    //   let port = this.addDevice.ports[0];
    //   port.source_device = this.addDevice._id;
    //   if(port.destination_device != null) {
    //     let currentDestination = port.destination_device;
    //     this.addDestinationDevices.forEach(destination => {
    //       if(destination._id.includes(currentDestination)) {
    //         port.destination_device = destination._id;
    //       }
    //     });
    //   }
    // }
  }

  CreateDevice() {
    let res: Result[] = [];
    this.api.AddDevice(this.addDevice).subscribe(
      success => {
        res.push({message: this.addDevice._id + " was successfully added.", success: true });
        this.openDialog(MessageType.Success, "Building Added", null, res);
      },
      error => {
        let errorMessage = this.S.ErrorCodeMessages[error.status]

        res.push({message: error.json(), success: false, error: error});
        this.openDialog(MessageType.Error, errorMessage, null, res);
      });
  }

  UpdateDevice() {
    let res: Result[] = [];
    this.api.UpdateDevice(this.IDToUpdate, this.editDevice).subscribe(
      success => {
        res.push({message: this.editDevice._id + " was successfully updated.", success: true });
        this.openDialog(MessageType.Success, "Device Updated", null, res);
      },
      error => {
        let errorMessage = this.S.ErrorCodeMessages[error.status]

        res.push({message: error.json(), success: false, error: error});
        this.openDialog(MessageType.Error, errorMessage, null, res);
      });
  }
  
  openDialog(status: MessageType, subheader: string, message?: string, results?: Result[]) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {type: status, subheader: subheader, message: message, results: results}
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
