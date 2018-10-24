import { Component, OnInit, Input, wtfStartTimeRange } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DeviceType, Device, Group, Room, Template, UIConfig, IOConfiguration, Preset, Panel } from '../../objects';
import { Defaults } from '../../services/defaults.service';
import { SmeeComponent } from '../smee.component';
import { PresetModalComponent } from '../../modals/presetmodal/presetmodal.component';
import { MatDialog, MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/material';
import { IconModalComponent } from '../../modals/iconmodal/iconmodal.component';
import { ModalService } from '../../services/modal.service';

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
  removedDevices: Device[] = [];

  presetSearch: string;
  filteredPresets: Preset[] = [];

  deviceSearch: string;
  filteredDevices: Device[] = [];

  constructor(private api: ApiService, public D: Defaults, public dialog: MatDialog, public M: ModalService) {
    
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
    if(dev == null) {
      return [];
    }
    if(this.TypeHasRole(this.deviceTypeMap.get(dev.type._id), "ControlProcessor")) {
      return ['Pi', 'NotPi'];
    }
    else {
      return ['NotPi'];
    }
  }

  AddNewDevice(typeID: string): Device {
    let type = this.deviceTypeMap.get(typeID);
    let device = new Device(type);

    device.name = this.D.DefaultDeviceNames[device.type._id];

    let NumRegex = /[0-9]/;
    let num = 1;
    this.devicesInRoom.forEach(dev => {
      let check = dev.name;
      let index = check.search(NumRegex);
      let prefix = check.substring(0, index);
      if(prefix == device.name) {
        num++;
      }
    });
    device.name = device.name + num;

    device._id = this.data._id + "-" + device.name;
    device.address = device._id + ".byu.edu";
    device.display_name = this.D.DefaultDisplayName[device.type._id];

    this.devicesInRoom.push(device);
    this.devicesInRoom = this.devicesInRoom.sort(this.sortAlphaNum);

    return device;
  }

  ApplyTemplate(temp: Template) {
    let newDevices: Device[] = [];
    temp.base_types.forEach(type => {
      newDevices.push(this.AddNewDevice(type));
    });

    let newPreset = new Preset();
    let panel = new Panel();
    
    for(let i = 0; i < newDevices.length; i++) {
      let type = this.deviceTypeMap.get(newDevices[i].type._id);

      if(this.TypeHasRole(type, "VideoOut") && newPreset.name == null) {
        newPreset.name = newDevices[i].display_name;
        newPreset.icon = this.D.DefaultIcons[newDevices[i].type._id];

        this.uiconfig.presets.forEach(preset => {
          if(preset.name == newPreset.name) {
            let NumRegex = /[0-9]/;
            let index = newDevices[i].name.search(NumRegex);
            let devNum = newDevices[i].name.substring(index);
            newPreset.name = newPreset.name + " " + devNum;
          }
        });
      }
      
      if(type.input && !type.output) {
        let io = new IOConfiguration();
        io.name = newDevices[i].name;
        io.icon = this.D.DefaultIcons[newDevices[i].type._id];
        newPreset.inputs.push(io.name);
        this.uiconfig.inputConfiguration.push(io);
      }

      if(type.output && !type.input) {
        let io = new IOConfiguration();
        io.name = newDevices[i].name;
        io.icon = this.D.DefaultIcons[newDevices[i].type._id];
        this.uiconfig.outputConfiguration.push(io);

        if(this.TypeHasRole(type, "VideoOut")) {
          newPreset.displays.push(io.name);
          newPreset.audioDevices.push(io.name);
        }

        if(this.TypeHasRole(type, "Microphone")) {
          newPreset.independentAudioDevices.push(io.name);
        }
      }

      if(this.TypeHasRole(type, "ControlProcessor")) {
        
      }
    }

    newDevices.forEach(d => {
      if(this.TypeHasRole(this.deviceTypeMap.get(d.type._id), "ControlProcessor")) {
        panel.hostname = d._id;
        panel.preset = newPreset.name;
        if(newPreset.displays.length > 1) {
          panel.uipath = "/cherry";
        }
        else {
          panel.uipath = "/blueberry";
        }
      }
    });

    this.uiconfig.panels.push(panel);
    this.uiconfig.presets.push(newPreset);
  }

  RemovePreset(preset: Preset) {
    if(preset != null) {
      delete this.uiconfig.presets[this.uiconfig.presets.indexOf(preset)];
      this.uiconfig.presets = this.uiconfig.presets.filter(this.notEmpty);
    }
  }

  RemoveFromPreset(preset: Preset, deviceName: string) {
    if(preset.displays != null && preset.displays.includes(deviceName)) {
      delete preset.displays[preset.displays.indexOf(deviceName)];
      preset.displays = preset.displays.filter(this.notEmpty).sort(this.stringSort);
    }

    if(preset.audioDevices != null && preset.audioDevices.includes(deviceName)) {
      delete preset.audioDevices[preset.audioDevices.indexOf(deviceName)];
      preset.audioDevices = preset.audioDevices.filter(this.notEmpty).sort(this.stringSort);
    }

    if(preset.inputs != null && preset.inputs.includes(deviceName)) {
      delete preset.inputs[preset.inputs.indexOf(deviceName)];
      preset.inputs = preset.inputs.filter(this.notEmpty).sort(this.stringSort);
    }

    if(preset.independentAudioDevices != null && preset.independentAudioDevices.includes(deviceName)) {
      delete preset.independentAudioDevices[preset.independentAudioDevices.indexOf(deviceName)];
      preset.independentAudioDevices = preset.independentAudioDevices.filter(this.notEmpty).sort(this.stringSort);
    }
  }

  AddToPreset(deviceName?: string, io?: IOConfiguration) {

  }

  RemoveDeviceFromRoom(device: Device) {
    this.removedDevices.push(device);
    delete this.devicesInRoom[this.devicesInRoom.indexOf(device)];
    this.devicesInRoom = this.devicesInRoom.filter(this.notEmpty).sort(this.sortAlphaNum);

    if(this.filteredDevices.includes(device)) {
      delete this.filteredDevices[this.filteredDevices.indexOf(device)];
      this.filteredDevices = this.filteredDevices.filter(this.notEmpty).sort(this.sortAlphaNum);
    }

    let panelCheck;
    this.uiconfig.panels.forEach(panel => {
      if(panel.hostname === device._id) {
        panelCheck = panel;
      }
    });

    if(panelCheck != null) {
      delete this.uiconfig.panels[this.uiconfig.panels.indexOf(panelCheck)];
      this.uiconfig.panels = this.uiconfig.panels.filter(this.notEmpty);
    }

    this.uiconfig.presets.forEach(preset => {
      this.RemoveFromPreset(preset, device.name);
    });
  }

  ClearAll() {
    this.uiconfig.presets = [];
    this.filteredPresets = [];
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
  OpenPresetModal(presetID: string) {
    let panels: Panel[] = [];
    this.uiconfig.panels.forEach(p => {
      if(p.preset == presetID) {
        panels.push(p);
      }
    });

    this.M.OpenPresetModal({ config: this.uiconfig, preset: this.GetPreset(presetID), panels: panels, devices: this.devicesInRoom, types: this.deviceTypeMap, typeList: this.deviceTypeList });
  }

  ChangeIcon(caller: any) {
    caller.icon = this.M.OpenIconModal();
  }
  /*-*/

  GetPreset(presetID: string): Preset {
    let p = new Preset();
    this.uiconfig.presets.forEach(pre => {
      if(pre.name === presetID) {
        p = pre;

        // Initialize shareableDisplays since many are missing that
        if(p.shareableDisplays == null) {
          p.shareableDisplays = [];
        }

        // Initialize independentAudioDevices since many are missing that
        if(p.independentAudioDevices == null) {
          p.independentAudioDevices = [];
        }
      }
    });

    return p;
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

  stringSort(a,b) {
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
