import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DeviceType, Device, Group, Room, Template, UIConfig, IOConfiguration, Preset, Panel } from '../../objects';
import { Defaults } from '../../services/defaults.service';
import { SmeeComponent } from '../smee.component';
import { PresetModalComponent } from '../../modals/presetmodal/presetmodal.component';
import { MatDialog, MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/material';

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
  devicesInRoom: Device[] = [];
  unusedDevices: Device[] = [];

  presetSearch: string;
  filteredPresets: Preset[] = [];

  deviceSearch: string;
  filteredDevices: Device[] = [];

  constructor(private api: ApiService, public D: Defaults, public dialog: MatDialog) {
    
  }

  ngOnInit() {
    this.GetDeviceTypes();
    this.GetTemplates();
  }

  ngOnChanges() {
  }

  GetPresetUIPath(presetName: string): string {
    for(let i = 0; i < this.uiconfig.panels.length; i++) {
      if(this.uiconfig.panels[i].preset === presetName) {
        return this.uiconfig.panels[i].uipath;
      }
    }
  }

  GetDeviceByName(name: string): Device {
    for(let i = 0; i < this.devicesInRoom.length; i++) {
      if(this.devicesInRoom[i].name === name) {
        return this.devicesInRoom[i];
      }
    }
  }

  IsInThisMenu(groupName: string, type: DeviceType): boolean {
    return type.tags.includes(groupName);
  }

  ApplyTemplate(temp: Template) {
    this.template = temp;
  }

  TypeHasRole(dType: DeviceType, roleID: string): boolean {
    if(dType != null && dType.roles != null && dType.roles.length > 0) {
        let found: boolean = false;
        dType.roles.forEach(r => {
            if(r._id === roleID) {
                found = true;
            }
        });
        return found;
    }
  }

  SetValidDropZones(dev: Device): string[] {
    if(this.TypeHasRole(this.deviceTypeMap.get(dev.type._id), "ControlProcessor")) {
      return ['Pi', 'NotPi'];
    }
    else {
      return ['NotPi'];
    }
  }

  CreateNewDevice(type: DeviceType): Device  {
    return new Device(type);
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

        this.GetDevicesInRoom();
      }
    })
  }

  GetUIConfig() {
    this.api.GetUIConfig(this.data._id).subscribe(val => {
      if(val != null) {
        this.uiconfig = val;

        if(this.uiconfig.outputConfiguration == null || this.uiconfig.outputConfiguration.length == 0) {
          this.uiconfig.outputConfiguration = [];
          
          this.devicesInRoom.forEach(device => {
            if(this.TypeHasRole(this.deviceTypeMap.get(device.type._id), "VideoOut") || this.TypeHasRole(this.deviceTypeMap[device.type._id], "Microphone")) {
              let io = new IOConfiguration();
              io.name = device.name;
              io.icon = this.D.DefaultIcons[device.type._id];
              this.uiconfig.outputConfiguration.push(io);
            }
          })
        }

        this.filteredPresets = this.uiconfig.presets;
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
        this.filteredDevices = this.devicesInRoom;
        this.GetUIConfig();
      }
    });
  }
  //* *//

  ///// RESPONSE MESSAGE /////
  // openDialog opens a modal from the Modal Component.
  openDialog(preset: Preset) {
    let panels: Panel[] = [];
    this.uiconfig.panels.forEach(p => {
      if(p.preset == preset.name) {
        panels.push(p);
      }
    });

    let dialogRef = this.dialog.open(PresetModalComponent, { data: { config: this.uiconfig, preset: preset, panels: panels, devices: this.devicesInRoom, types: this.deviceTypeMap, typeList: this.deviceTypeList }});

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  /*-*/

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

  SearchPresets() {
    this.filteredPresets = [];

    if(this.presetSearch == null || this.presetSearch.length == 0) {
      this.filteredPresets = this.uiconfig.presets;
      return;
    }

    this.uiconfig.panels.forEach(panel => {
      this.uiconfig.presets.forEach(p => {
        if(panel.hostname.toLowerCase().includes(this.presetSearch.toLowerCase())) {
          if(p.name === panel.preset && !this.filteredPresets.includes(p)) {
            this.filteredPresets.push(p);
          }
        }
        if(panel.uipath.toLowerCase().includes(this.presetSearch.toLowerCase())) {
          if(p.name === panel.preset && !this.filteredPresets.includes(p)) {
            this.filteredPresets.push(p);
          }
        }
        panel.features.forEach(feature => {
          if(feature.toLowerCase().includes(this.presetSearch.toLowerCase())) {
            if(p.name === panel.preset && !this.filteredPresets.includes(p)) {
              this.filteredPresets.push(p);
            }
          }
        });
      });
    });

    this.uiconfig.presets.forEach(preset => {
      if(preset.name.toLowerCase().includes(this.presetSearch.toLowerCase()) && !this.filteredPresets.includes(preset)) {
        this.filteredPresets.push(preset);
      }
      preset.displays.forEach(display => {
        if(display.toLowerCase().includes(this.presetSearch.toLowerCase()) && !this.filteredPresets.includes(preset)) {
          this.filteredPresets.push(preset);
        }
      });
      preset.inputs.forEach(input => {
        if(input.toLowerCase().includes(this.presetSearch.toLowerCase()) && !this.filteredPresets.includes(preset)) {
          this.filteredPresets.push(preset);
        }
      });
      if(preset.independentAudioDevices != null) {
        preset.independentAudioDevices.forEach(mic => {
          if(mic.toLowerCase().includes(this.presetSearch.toLowerCase()) && !this.filteredPresets.includes(preset)) {
            this.filteredPresets.push(preset);
          }
        });
      }
    });
  }

  SearchDevices() {
    this.filteredDevices = [];

    if(this.deviceSearch == null || this.deviceSearch.length == 0) {
      this.filteredDevices = this.devicesInRoom;
      return;
    }

    this.devicesInRoom.forEach(device => {
      if(device.name.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.display_name.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.type._id.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      device.roles.forEach(role => {
        if(role._id.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
          this.filteredDevices.push(device);
        }
      });

      if(device.tags != null) {
        device.tags.forEach(tag => {
          if(tag.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
            this.filteredDevices.push(device);
          }
        });
      }
    });
  }
}
