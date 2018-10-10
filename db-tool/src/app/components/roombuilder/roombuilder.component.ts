import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DeviceType, Device, Group, Room, Template, UIConfig } from '../../objects';
import { Defaults } from '../../services/defaults.service';
import { SmeeComponent } from '../smee.component';

@Component({
  selector: 'app-roombuilder',
  templateUrl: './roombuilder.component.html',
  styleUrls: ['./roombuilder.component.scss']
})
export class RoomBuilderComponent implements OnInit, SmeeComponent {
  @Input() data: Room;
  deviceTypeList: DeviceType[] = [];
  deviceTypeMap: Map<string, DeviceType> = new Map();
  template: Template;
  templateList: Template[] = [];
  uiconfig: UIConfig = new UIConfig();
  groupList: Group[] = [];
  devicesInRoom: Device[] = [];
  unusedDevices: Device[] = [];

  constructor(private api: ApiService, public D: Defaults) {
    
  }

  ngOnInit() {
    this.GetDeviceTypes();
    this.GetTemplates(); 
  }

  ngOnChanges() {
    if(this.data != null) {
      this.GetDevicesInRoom();
      this.GetUIConfig();
    }
  }

  IsInThisMenu(groupName: string, type: DeviceType): boolean {
    return type.tags.includes(groupName);
  }

  ApplyTemplate(temp: Template) {
    this.template = temp;
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

  CreateGroupsFromUIConfig() {
    this.groupList = [];

    if(this.uiconfig != null && this.uiconfig.presets != null) {
      this.uiconfig.presets.forEach(preset => {
        let group = new Group();
        group.preset = preset;
        
        this.devicesInRoom.forEach(device => {
          this.uiconfig.panels.forEach(panel => {
            if(preset.name === panel.preset && panel.hostname === device._id && !group.devices.includes(device)) {
              group.devices.push(device);
            }
          });

          preset.displays.forEach(displayName => {
            if(device.name.includes(displayName) && !group.devices.includes(device)) {
              group.devices.push(device);
            }
          });

          preset.inputs.forEach(inputName => {
            if(device.name.includes(inputName) && !group.devices.includes(device)) {
              group.devices.push(device);
            }
          });

        })

        this.groupList.push(group);
      })
    }
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

  GetUIConfig() {
    this.api.GetUIConfig(this.data._id).subscribe(val => {
      if(val != null) {
        this.uiconfig = val;
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

  GetDevicesInRoom() {
    this.api.GetDeviceList(this.data._id).subscribe(val => {
      if(val != null) {
        this.devicesInRoom = val;
      }
    });
  }
  //* *//

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
