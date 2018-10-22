import { Component, OnInit, Input } from '@angular/core';
import { SmeeComponent } from '../smee.component';
import { Device, DeviceType, Template } from '../../objects';
import { ApiService } from '../../services/api.service';
import { Strings } from '../../services/strings.service';
import { Defaults } from '../../services/defaults.service';

@Component({
  selector: 'app-devicelist',
  templateUrl: './devicelist.component.html',
  styleUrls: ['./devicelist.component.scss']
})
export class DeviceListComponent implements OnInit, SmeeComponent {
  @Input() data: Device[];
  filteredDevices: Device[];
  searchQuery: string;
  templateList: Template[] = [];
  deviceTypeList: DeviceType[] = [];
  deviceTypeMap: Map<string, DeviceType> = new Map();
  roomID: string;

  constructor(private api: ApiService, public S: Strings, public D: Defaults) {
    
  }

  ngOnInit() {
    this.filteredDevices = this.data;

    if(this.data != null && this.data.length > 0) {
      let idArray = this.data[0]._id.split("-");
      this.roomID = idArray[0] + "-" + idArray[1];

      this.GetDeviceTypes();
      this.GetTemplates();
    }
  }

  Search() {
    this.filteredDevices = [];

    if(this.searchQuery == null || this.searchQuery.length == 0) {
      this.filteredDevices = this.data;
      return;
    }

    this.data.forEach(device => {
      if(device._id.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.name.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.display_name.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.address.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.description.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.type._id.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      
    });

    this.data.forEach(device => {
      device.roles.forEach(role => {
        if(role._id.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
          this.filteredDevices.push(device);
        }

        if(role.description.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
          this.filteredDevices.push(device);
        }
      });

      if(device.ports != null) {
        device.ports.forEach(port => {
          if(port._id.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
            this.filteredDevices.push(device);
          }

          if(port.friendly_name.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
            this.filteredDevices.push(device);
          }

          if(port.source_device != null && port.source_device.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
            this.filteredDevices.push(device);
          }

          if(port.destination_device != null && port.destination_device.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
            this.filteredDevices.push(device);
          }
        });
      }

      if(device.tags != null) {
        device.tags.forEach(tag => {
          if(tag.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredDevices.includes(device)) {
            this.filteredDevices.push(device);
          }
        });
      }
    })
  }

  AddNewDevice(typeID: string): Device {
    let type = this.deviceTypeMap.get(typeID);
    let device = new Device(type);

    device.name = this.D.DefaultDeviceNames[device.type._id];

    let NumRegex = /[0-9]/;
    let num = 1;
    this.data.forEach(dev => {
      let check = dev.name;
      let index = check.search(NumRegex);
      let prefix = check.substring(0, index);
      if(prefix == device.name) {
        num++;
      }
    });
    device.name = device.name + num;

    device._id = this.roomID + "-" + device.name;
    device.address = device._id + ".byu.edu";
    device.display_name = this.D.DefaultDisplayName[device.type._id];

    this.data.push(device);
    this.data = this.data.sort(this.sortAlphaNum);

    return device;
  }

  ApplyTemplate(temp: Template) {
    let newDevices: Device[] = [];
    temp.base_types.forEach(type => {
      newDevices.push(this.AddNewDevice(type));
    });
  }

  IsInThisMenu(groupName: string, type: DeviceType): boolean {
    return type.tags.includes(groupName);
  }

  ///// API FUNCTIONS /////
  GetDeviceTypes() {
    this.api.GetDeviceTypesList().subscribe(val => {
      if(val != null) {
        this.deviceTypeList = val;
        this.deviceTypeMap = new Map();

        this.deviceTypeList.forEach(type => {
          this.deviceTypeMap.set(type._id, type)
        });
      }
    })
  }

  GetTemplates() {
    this.api.GetTemplates().subscribe(val => {
      if(val != null) {
        this.templateList = val;
      }
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
