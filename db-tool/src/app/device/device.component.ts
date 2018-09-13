import { Component, OnInit, Input } from '@angular/core';
import { Building, Room, Device, DeviceType, Role, Port } from '../objects';
import { ApiService } from '../api.service'; 
import { MatDialog, ErrorStateMatcher } from '@angular/material';
import { ModalComponent, MessageType, Result } from '../modal/modal.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';
import { Strings } from '../strings.service';
import { Defaults } from '../defaults.service';

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
  addSourceDevices: string[] = [];
  editSourceDevices: string[] = [];
  addDestinationDevices: string[] = [];
  editDestinationDevices: string[] = [];
  @Input() deviceTypeList: DeviceType[] = [];
  @Input() deviceTypeMap: Map<string, DeviceType> = new Map();
  deviceRoleList: Role[] = [];
  addRoleList: Role[] = [];
  editRoleList: Role[] = [];
  switcherTypes: string[] = ["Blu50", "Kramer VS-44DT", "DM-MD16x16", "PulseEight8x8", "ShureULXD"]

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private api: ApiService, public dialog: MatDialog, public S: Strings, public D: Defaults) {}

  ngOnInit() {
    
    this.GetAddBuildingList();
    this.GetEditBuildingList();

    if(!this.InStepper) {
      this.GetDeviceRoleList();
      this.GetDeviceTypeList();

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
      this.SetSourceAndDestinationLists();
      this.GetDeviceRoleList();
      // this.UpdateDeviceTypeInfo();      
    }, 0); 
  }

  // EditDeviceChanges makes any changes necessary when the EditDevice is selected.
  EditDeviceChanges() {
    this.IDToUpdate = this.editDevice._id; 
    this.editType = this.deviceTypeMap.get(this.editDevice.type._id); 
    this.editDevice.type = new DeviceType();
    this.editDevice.type._id = this.editType._id;
    this.SetSourceAndDestinationLists();
    this.UpdateMissingPorts(this.editDevice);
  }

  // UpdateID fills in the ID with the roomID and also updates it when the name is changed since the ID is a read only field. It also updates the address.
  UpdateID() {
    if(this.addDevice != null) {
      if (this.addRoom != null && this.addRoom._id != null) {
        let id = this.addRoom._id.concat("-");
        if(this.addDevice.name != null) {
          id = id + this.addDevice.name;
        }
        this.addDevice._id = id;

        // Update device address
        if(this.addDevice.address == null || this.addDevice.address.includes(this.addRoom._id)) {
          this.addDevice.address = this.addDevice._id + ".byu.edu"
        }
      }
    }

    if(this.editDevice != null) {
      if (this.editRoom != null && this.editRoom._id != null) {
        let id = this.editRoom._id.concat("-");
        if(this.editDevice.name != null) {
          id = id + this.editDevice.name;
        }
        this.editDevice._id = id;

        // Update device address
        if(this.editDevice.address == null || this.editDevice.address.includes(this.editRoom._id)) {
          this.editDevice.address = this.editDevice._id + ".byu.edu"
        }
      }
    }
  }

  // UpdateRoleLists gets called when a role is selected from the drop down to then rearrange the options in the select box.
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

  // GetDeviceNumberFromID returns the number of device that this device in the naming convention for the room.
  GetDeviceNumberFromID(ID: string): number {
    let NumRegex = /[0-9]/;
    let IDEnd = ID.split("-", 3)[2];
    let index = IDEnd.search(NumRegex)
    let devNumber: string = IDEnd.substring(index);
    return parseInt(devNumber);
  }

  // Returns a port from a device if it has it, and null if it does not.
  GetDevicePort(device: Device, portID: string): Port {
    for(let i = 0; i < device.ports.length; i++) {
      if(device.ports[i]._id === portID) {
        return device.ports[i];
      }
    }
    return null;
  }

  // VerifyDeviceHasPort only checks to see if the device has the port or not, and returns a boolean.
  VerifyDeviceHasPort(device: Device, portID: string): boolean {
    for(let i = 0; i < device.ports.length; i++) {
      if(device.ports[i]._id === portID) {
        return true;
      }
    }
    return false;
  }

  // DeviceTypeChange edits the device information based on a change in DeviceType.
  DeviceTypeChange() {
    if(this.addDevice != null && this.addDevice.type != null) {
      let type = this.deviceTypeMap.get(this.addDevice.type._id)
      
      // Set the type to the AddType
      this.addType = type;

      // Set the roles for the device to include whatever type roles there are.
      if(this.addType != null && this.addType.roles != null) {
        this.addDevice.roles = this.addType.roles;
      }

      this.UpdateRoleLists(true);

      // Set the ports for the device to include whatever ports there are on the type.
      if(this.addType != null && this.addType.ports != null) {
        this.addDevice.ports = this.addType.ports;
      }
      else {
        this.addDevice.ports = [];
      }

      // Set the address of the device to be the hostname or whatever default address.
      this.addDevice.address = this.D.DefaultAddress[this.addDevice.type._id];

      if(this.addDevice.address == null) {
        this.addDevice.address = this.addDevice._id + ".byu.edu"
      }

      // Set the display name based on the type.
      if(this.D.DefaultDisplayName[this.addDevice.type._id] != null) {
        this.addDevice.display_name = this.D.DefaultDisplayName[this.addDevice.type._id];
        let num = this.GetDeviceNumberFromID(this.addDevice._id);
        if(num != null && num > 1) {
          this.addDevice.display_name = this.addDevice.display_name + " " + num;
        }
      }
    }
    if(this.editDevice != null && this.editDevice.type != null && this.editDevice._id != null) {
      let type = this.deviceTypeMap.get(this.editDevice.type._id)
      
      // Set the type to the EditType
      this.editType = type;

      // Set the roles for the device to include whatever type roles there are.
      if(this.editType != null && this.editType.roles != null) {
        this.editDevice.roles = this.editType.roles;
      }

      this.UpdateRoleLists(false);

      // Set the ports for the device to include whatever ports there are on the type.
      if(this.editType != null && this.editType.ports != null) {
        this.editDevice.ports = this.editType.ports;
      }
      else {
        this.editDevice.ports = [];
      }

      // Set the address of the device to be the hostname or whatever default address.
      this.editDevice.address = this.D.DefaultAddress[this.editDevice.type._id];

      if(this.editDevice.address == null) {
        this.editDevice.address = this.editDevice._id + ".byu.edu"
      }

      // Set the display name based on the type.
      if(this.D.DefaultDisplayName[this.editDevice.type._id] != null) {
        this.editDevice.display_name = this.D.DefaultDisplayName[this.editDevice.type._id];
        let num = this.GetDeviceNumberFromID(this.editDevice._id);
        if(num != null && num > 1) {
          this.editDevice.display_name = this.editDevice.display_name + " " + num;
        }
      }
    }

    this.SetSourceAndDestinationLists();
  }

  // SetSourceAndDestinationLists updates the source and destination lists for port configuration.
  SetSourceAndDestinationLists() {
    this.addSourceDevices = [];
    this.addDestinationDevices = [];

    this.editSourceDevices = [];
    this.editDestinationDevices = [];

    // Do the AddDeviceList
    if(this.addDeviceList != null && this.addType != null) {
      // Add the device list to either sources or destinations.
      this.addDeviceList.forEach(device => {
        let type = this.deviceTypeMap.get(device.type._id);

        if(type.source) {
          this.addSourceDevices.push(device._id);
        }
        if(type.destination) {
          this.addDestinationDevices.push(device._id);
        }
      });

      // Add the current device to either sources or destinations.
      if(this.addType.source && !this.addSourceDevices.includes(this.addDevice._id)) {
        this.addSourceDevices.push(this.addDevice._id);
      }
      if(this.addType.destination && !this.addDestinationDevices.includes(this.addDevice._id)) {
        this.addDestinationDevices.push(this.addDevice._id);
      }

      // Sort the arrays. 
      this.addSourceDevices = this.addSourceDevices.filter(this.notEmpty).sort(this.sortAlphaNum);

      this.addDestinationDevices = this.addDestinationDevices.filter(this.notEmpty).sort(this.sortAlphaNum);
    }

    // Do the EditDeviceList
    if(this.editDeviceList != null && this.editType != null) {
      // Add the device list to either sources or destinations.
      this.editDeviceList.forEach(device => {
        let type = this.deviceTypeMap.get(device.type._id);

        if(type.source) {
          this.editSourceDevices.push(device._id);
        }
        if(type.destination) {
          this.editDestinationDevices.push(device._id);
        }
      });

      // Add the current device to either sources or destinations.
      if(this.editType.source && !this.editSourceDevices.includes(this.editDevice._id)) {
        this.editSourceDevices.push(this.editDevice._id);
      }
      if(this.editType.destination && !this.editDestinationDevices.includes(this.editDevice._id)) {
        this.editDestinationDevices.push(this.editDevice._id);
      }

      // Sort the arrays. 
      this.editSourceDevices = this.editSourceDevices.filter(this.notEmpty).sort(this.sortAlphaNum);

      this.editDestinationDevices = this.editDestinationDevices.filter(this.notEmpty).sort(this.sortAlphaNum);
    }
  }

  // UpdateMissingPorts fills in any missing ports that are on the DeviceType but not on the Device itself.
  UpdateMissingPorts(device: Device) {
    let type = this.deviceTypeMap.get(device.type._id);

    let newPorts: Port[] = [];

    type.ports.forEach(port => {
      if(this.VerifyDeviceHasPort(device, port._id)) {
        newPorts.push(this.GetDevicePort(device, port._id));
      }
      else {
        newPorts.push(port);
      }
    });

    device.ports = newPorts;
  }

  // SetDefaultPortConfiguration attempts to fill in any default port information that is largely based 
  SetDefaultPortConfigurations() {
    let NumRegex = /[0-9]/;
    let IDEnd = this.addDevice._id.split("-", 3)[2];
    let index = IDEnd.search(NumRegex)
    let devNumber: string = IDEnd.substring(index);

    if(this.addDevice.ports != null) {
      let defaultPorts = this.D.DefaultPorts[this.addDevice.type._id];

      this.addDevice.ports.forEach(port => {  
        let sourceName = defaultPorts[port._id].source;
        this.addSourceDevices.forEach(source => {
          let name = source.split("-", 3)[2];
          if(name.includes(sourceName) && name.includes(devNumber)) {
            port.source_device = source;
          }
        });

        let destName = defaultPorts[port._id].destination;
        this.addDestinationDevices.forEach(dest => {
          let name = dest.split("-", 3)[2];
          if(name.includes(destName) && name.includes(devNumber)) {
            port.destination_device = dest;
          }
        });
      });
    }
  }

  ///// API FUNCTIONS /////
  GetAddBuildingList() {
    if(!this.InStepper) {
      this.addBuilding = new Building();
      this.addRoom = new Room();
      this.addDevice = new Device();
      this.addDevice.type = new DeviceType();
    }

    this.addBuildingList = [];

    this.api.GetBuildingList().subscribe(val => {
      this.addBuildingList = val;
    });
  }

  GetEditBuildingList() {
    this.editBuilding = new Building();
    this.editRoom = new Room();
    this.editDevice = new Device();
    this.editDevice.type = new DeviceType();

    this.editBuildingList = [];

    this.api.GetBuildingList().subscribe(val => {
      this.editBuildingList = val;
    });
  }

  GetAddRoomList() {
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

  GetEditRoomList() {
    this.editRoom = new Room();
    this.editDevice = new Device();
    this.editDevice.type = new DeviceType();

    this.editRoomList = [];

    this.api.GetRoomList(this.editBuilding._id).subscribe(val => {
      this.editRoomList = val;
    });
  }

  GetAddDeviceList() {
    if(!this.InStepper) {
      this.addDevice = new Device();
      this.addDevice.type = new DeviceType();
    }

    this.UpdateID();  

    this.UpdateRoleLists(true);

    this.addDeviceList = [];

    this.api.GetDeviceList(this.addRoom._id).subscribe(val => {
      this.addDeviceList = val;
    });
  }

  GetEditDeviceList() {
    this.editDevice = new Device();
    this.editDevice.type = new DeviceType();

    this.editDeviceList = [];

    this.api.GetDeviceList(this.editRoom._id).subscribe(val => {
      this.editDeviceList = val;
    });
  }

  GetDeviceTypeList() {
    this.deviceTypeList = [];
    this.api.GetDeviceTypesList().subscribe(val => {
      this.deviceTypeList = val;

      this.deviceTypeList.forEach(type => {
        this.deviceTypeMap.set(type._id, type);
      })
    });
  }

  GetDeviceRoleList() {
    this.deviceRoleList = [];
    this.api.GetDeviceRolesList().subscribe(val => {
      this.deviceRoleList = val;  
      this.UpdateRoleLists(true);
    });
  }
  /*-*/

  ///// DATABASE SUBMISSION /////
  CreateDevice() {
    console.log(this.addDevice)
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
  /*-*/
  
  ///// RESPONSE MESSAGE /////
  openDialog(status: MessageType, subheader: string, message?: string, results?: Result[]) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {type: status, subheader: subheader, message: message, results: results}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  /*-*/

  ///// TAGS /////
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
  /*-*/

  ///// ARRAY FUNCTIONS /////
  notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    // Remove all empty and null values from the array.
    return value !== null && value !== undefined;
  }

  sortAlphaNum(a,b) {
    // Sort the array first alphabetically and then numerically.
    let reA: RegExp = /[^a-zA-Z]/g;
    let reN: RegExp = /[^0-9]/g;
    
    let aA = a.replace(reA, "");
    let bA = b.replace(reA, "");

    if(aA === bA) {
        let aN = parseInt(a.replace(reN, ""), 10);
        let bN = parseInt(b.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
  }
  /*-*/
}
