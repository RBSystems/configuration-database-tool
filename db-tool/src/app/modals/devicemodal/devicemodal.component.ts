import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from '../../services/api.service';
import { Defaults } from '../../services/defaults.service';
import { Device, DeviceType, Port } from '../../objects';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';

export interface DeviceData {
  device: Device;
  deviceExists: boolean;
  devicesInRoom: Device[];
  deviceTypeList: DeviceType[];
  deviceTypeMap: Map<string, DeviceType>;
}

@Component({
  selector: 'app-devicemodal',
  templateUrl: './devicemodal.component.html',
  styleUrls: ['./devicemodal.component.scss']
})
export class DeviceModalComponent implements OnInit {
  roleList = [];
  unappliedRoles = [];
  currentType: DeviceType = new DeviceType();
  sourceDevices: Device[];
  destinationDevices: Device[];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public dialogRef: MatDialogRef<DeviceModalComponent>, @Inject(MAT_DIALOG_DATA) public data: DeviceData, private api: ApiService, public D: Defaults) {
    this.FillMissingPorts();
    this.SetSourceAndDestinationLists();
  }

  ngOnInit() {
    this.GetDeviceRoleList();
  }

  close() {
    this.dialogRef.close();
  }

  // UpdateRoleLists gets called when a role is selected from the drop down to then rearrange the options in the select box.
  UpdateRoleLists() {
    this.unappliedRoles = [];
    this.roleList.forEach(role => {
      let PushToAddList : boolean = true;
      
      this.data.device.roles.forEach(dRole => {
        if(role._id == dRole._id) {
          PushToAddList = false;
        }
      });
      if(PushToAddList) {
        this.unappliedRoles.push(role);
      }
    });
  }

  // DeviceTypeChange edits the device information based on a change in DeviceType.
  DeviceTypeChange() {
    if(this.data.device != null && this.data.device.type != null) {
      let type = this.data.deviceTypeMap.get(this.data.device.type._id)
      
      // Set the type to the AddType
      this.currentType = type;

      // Set the roles for the device to include whatever type roles there are.
      if(this.currentType != null && this.currentType.roles != null) {
        this.data.device.roles = this.currentType.roles;
      }

      this.UpdateRoleLists();

      // Set the ports for the device to include whatever ports there are on the type.
      if(this.currentType != null && this.currentType.ports != null) {
        this.data.device.ports = [];
        this.currentType.ports.forEach(p => {
          let port = new Port();
          port._id = p._id;
          port.description = p.description;
          port.friendly_name = p.friendly_name;
          port.tags = p.tags

          this.data.device.ports.push(port);
        })
      }
      else {
        this.data.device.ports = [];
      }

      // Set the address of the device to be the hostname or whatever default address.
      this.data.device.address = this.D.DefaultAddress[this.data.device.type._id];

      if(this.data.device.address == null) {
        this.data.device.address = this.data.device._id + ".byu.edu"
      }

      // Set the display name based on the type.
      if(this.D.DefaultDisplayName[this.data.device.type._id] != null) {
        this.data.device.display_name = this.D.DefaultDisplayName[this.data.device.type._id];
        let num = this.GetDeviceNumberFromID(this.data.device._id);
        if(num != null && num > 1) {
          this.data.device.display_name = this.data.device.display_name + " " + num;
        }
      }
    }

    this.SetSourceAndDestinationLists();
  }

  // GetDeviceNumberFromID returns the number of device that this device in the naming convention for the room.
  GetDeviceNumberFromID(ID: string): number {
    let NumRegex = /[0-9]/;
    let IDEnd = ID.split("-", 3)[2];
    let index = IDEnd.search(NumRegex)
    let devNumber: string = IDEnd.substring(index);
    return parseInt(devNumber);
  }

  SetSourceAndDestinationLists() {
    this.sourceDevices = [];
    this.destinationDevices = [];

    this.data.devicesInRoom.forEach(device => {
      let type = this.data.deviceTypeMap.get(device.type._id);

      if(type.source && !this.sourceDevices.includes(device)) {
        this.sourceDevices.push(device);
      }

      if(type.destination && !this.destinationDevices.includes(device)) {
        this.destinationDevices.push(device);
      }
    });
  }

  IsAValidOption(option: Device, host: Device) {
    let validRoles: string[] = this.D.ValidPortOptionRoles[host.type._id];

    let result: boolean = false;

    validRoles.forEach(r => {
      if(this.HasRole(option, r)) {
        result = true;
      }
    });

    return result;
  }

  HasRole(device: Device, roleID: string): boolean {
    if(device.roles != null && device.roles.length > 0) {
        let found: boolean = false;
        device.roles.forEach(r => {
            if(r._id === roleID) {
                found = true;
            }
        });
        return found;
    }
  }

  ///// API FUNCTIONS /////
  SubmitDevice() {
    if(!this.data.deviceExists) {
      this.api.AddDevice(this.data.device).subscribe(
        success => {
          this.api.WriteTempChanges();
          this.data.deviceExists = true;
          this.dialogRef.close();
        },
        error => {
          this.dialogRef.close();
        });
    }
    else {
      this.api.UpdateDevice(this.data.device._id, this.data.device).subscribe(
        success => {
          this.api.WriteTempChanges();
          this.dialogRef.close();
        },
        error => {
          this.dialogRef.close();
        });
    }
  }

  DeleteDevice() {
    this.api.DeleteDevice(this.data.device._id).subscribe(
      success => {
        this.api.WriteTempChanges();
        this.data.deviceExists = false;
        this.dialogRef.close();
      },
      error => {
        this.dialogRef.close();
      });
  }

  GetDeviceRoleList() {
    this.api.GetDeviceRolesList().subscribe(val => {
      if(val != null) {
        this.roleList = val;
        this.UpdateRoleLists();
      }
    })
  }

  ///// TAGS /////
  AddChip(event: MatChipInputEvent): void {
    if(this.data.device.tags == null || this.data.device.tags.length == 0) {
      this.data.device.tags = [];
    }

    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim()) {
      this.data.device.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  RemoveChip(tag: string): void {
    let index_A = this.data.device.tags.indexOf(tag);
    if (index_A >= 0) {
      this.data.device.tags.splice(index_A, 1);
    }
  }
  /*-*/

  FillMissingPorts() {
    let type = this.data.deviceTypeMap.get(this.data.device.type._id);

    if(type.ports == null) {
      return;
    }

    console.log(this.data.device)

    type.ports.forEach(typePort => {
      let add: boolean = true;
      
      this.data.device.ports.forEach(devPort => {
        if(devPort._id == typePort._id) {
          add = false;
          devPort.friendly_name = typePort.friendly_name;
        }
      });

      if(add) {
        let p = new Port();
        p._id = typePort._id;
        p.friendly_name = typePort.friendly_name;
        p.description = typePort.description;
        p.source_device = "";
        p.destination_device = "";
        this.data.device.ports.push(p);
      }
    });

    this.data.device.ports.sort(this.portSorter);
  }

  RemoveMissingPorts() {

  }

  HasInPorts(device: Device): boolean {
    let type = this.data.deviceTypeMap.get(device.type._id);
    let response: boolean = false;

    if(type.ports != null) {
      console.log(type);
      type.ports.forEach(port => {
        if(port.tags.includes("port-in")) {
          response = true;
        }
      });
    }
    console.log(response);
    return response;
  }

  HasOutPorts(device: Device) {
    let type = this.data.deviceTypeMap.get(device.type._id);
    let response: boolean = false;

    if(type.ports != null) {
      type.ports.forEach(port => {
        if(port.tags.includes("port-out")) {
          response = true;
        }
      });
    }

    return response;
  }

  IsAnInPort(port: Port, deviceType: string): boolean {
    let type = this.data.deviceTypeMap.get(deviceType);
    let response: boolean = false;
    type.ports.forEach(p => {
      if(p._id === port._id) {
        if(p.tags.includes("port-in")) {
          response = true;
        }
        else {
          response = false;
        }
      }
    });
    return response;
  }

  IsAnOutPort(port: Port, deviceType: string): boolean{
    let type = this.data.deviceTypeMap.get(deviceType);
    let response: boolean = false;
    type.ports.forEach(p => {
      if(p._id === port._id) {
        if(p.tags.includes("port-out")) {
          response = true;
        }
        else {
          response = false;
        }
      }
    });
    return response;
  }

  portSorter(a: Port,b: Port) {
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
