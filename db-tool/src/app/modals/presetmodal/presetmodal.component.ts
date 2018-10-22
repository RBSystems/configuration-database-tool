import { Component, OnInit, Input, Inject } from '@angular/core';
import { UIConfig, Panel, Preset, Device, IOConfiguration, DeviceType } from '../../objects';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ApiService } from '../../services/api.service';
import { Strings } from '../../services/strings.service';
import { IconModalComponent } from '../iconmodal/iconmodal.component';

export interface UIInfo {
  config: UIConfig;
  preset: Preset;
  panels: Panel[];
  devices: Device[];
  types: Map<string, DeviceType>
  typeList: DeviceType[];
}

@Component({
  selector: 'app-presetmodal',
  templateUrl: './presetmodal.component.html',
  styleUrls: ['./presetmodal.component.scss']
})
export class PresetModalComponent implements OnInit {
  uipath: string;
  InputTypeMap: Map<string, IOConfiguration[]> = new Map();
  iconList: string[] = [];
  newPresetName: string = "";

  constructor(public dialogRef: MatDialogRef<PresetModalComponent>, @Inject(MAT_DIALOG_DATA) public data: UIInfo, public S: Strings, private api: ApiService, public dialog: MatDialog) {
    if(this.data.panels != null && this.data.panels.length > 0) {
      this.uipath = this.data.panels[0].uipath;
    }
    if(this.data.preset.shareableDisplays == null) {
      this.data.preset.shareableDisplays = [];
    }
    if(this.data.types != null) {
      this.CreateInputTypeMap();
    }
    this.newPresetName = this.data.preset.name;
  }

  ngOnInit() {
  }

  ngOnChanges() {
    
  }

  Close() {
    this.dialogRef.close()
  }

  ChangeIcon(caller: any) {
    let iconRef = this.dialog.open(IconModalComponent);

    iconRef.afterClosed().subscribe(result => {
      if(result != null) {
        caller.icon = result;
      }
    });
  }

  RoomHasIndependentAudios(): boolean {
    let report = false;
    this.data.devices.forEach(dev => {
      if(this.HasRole(dev, "Microphone")) {
        report = true;
      }
    });
    return report;
  }

  ValidatePresetName(): boolean {
    console.log(this.newPresetName)
    let ok: boolean = true;
    if(this.newPresetName != null && this.newPresetName != this.data.preset.name) {
      console.log("hello")
      for(let i = 0; i < this.data.config.presets.length; i++) {
        if(this.data.config.presets[i].name == this.newPresetName) {
          console.log(this.data.config.presets[i].name);
          console.log(this.newPresetName);
          if(this.data.preset.displays[0] != this.data.config.presets[i].displays[0]) {
            console.log("hello again")
            return false;
          }
        }
      }
    }
    this.data.preset.name = this.newPresetName;
    return ok;
  }

  UpdatePresetOnPanels() {
    if(this.data.panels != null) {
      this.data.panels.forEach(panel => {
        panel.preset = this.data.preset.name;
      });
    }
  }

  UpdateUIPathOnPanels() {
    if(this.data.panels != null) {
      this.data.panels.forEach(panel => {
        panel.uipath = this.uipath;
      });
      if(this.uipath === "/cherry") {
        this.ToggleSharing(false);
      }
    }
  }

  // UpdatePresetDisplays adds or removes the device from the list of displays that this preset controls depending on what boxes are checked.
  UpdatePresetDisplays(preset: Preset, display: string, checked: boolean) {
    if(checked && !preset.displays.includes(display)) {
      preset.displays.push(display);
      let d: (string | null)[] = preset.displays;
      preset.displays = d.filter(this.notEmpty).sort(this.sortAlphaNum);
      
      this.UpdateAudioDevices(preset, display, true)

      this.UpdateShareableDisplays(preset, display, false)
    }

    if(!checked && preset.displays.includes(display)) {
      delete preset.displays[preset.displays.indexOf(display)];
      let d: (string | null)[] = preset.displays;
      preset.displays = d.filter(this.notEmpty).sort(this.sortAlphaNum);

      this.UpdateAudioDevices(preset, display, false)
    }
  }

  // UpdateShareableDisplays adds or removes the device from the list of shareable displays depending on what boxes are checked.
  UpdateShareableDisplays(preset: Preset, display: string, checked: boolean) {
    if(checked && !preset.shareableDisplays.includes(display)) {
      preset.shareableDisplays.push(display);
      let d: (string | null)[] = preset.shareableDisplays;
      preset.shareableDisplays = d.filter(this.notEmpty).sort(this.sortAlphaNum);

      this.UpdatePresetDisplays(preset, display, false)
    }

    if(!checked && preset.shareableDisplays.includes(display)) {
      delete preset.shareableDisplays[preset.shareableDisplays.indexOf(display)];
      let d: (string | null)[] = preset.shareableDisplays;
      preset.shareableDisplays = d.filter(this.notEmpty).sort(this.sortAlphaNum);
    }
  }

  // UpdateAudioDevices adds or removes the device from the list of audio devices depending on what boxes are checked.
  UpdateAudioDevices(preset: Preset, display: string, checked: boolean) {
    if(checked && !preset.audioDevices.includes(display)) {
      preset.audioDevices.push(display);
      let d: (string | null)[] = preset.audioDevices;
      preset.audioDevices = d.filter(this.notEmpty).sort(this.sortAlphaNum);
    }

    if(!checked && preset.audioDevices.includes(display)) {
      delete preset.audioDevices[preset.audioDevices.indexOf(display)];
      let d: (string | null)[] = preset.audioDevices;
      preset.audioDevices = d.filter(this.notEmpty).sort(this.sortAlphaNum);
    }
  }

  // UpdatePresetInputs adds or removes the input from the list of inputs depending on what boxes are checked.
  UpdatePresetInputs(preset: Preset, input: string, checked: boolean) {
    if(checked && !preset.inputs.includes(input)) {
      preset.inputs.push(input);
      let i: (string | null)[] = preset.inputs;
      preset.inputs = i.filter(this.notEmpty).sort(this.sortAlphaNum);
    }

    if(!checked && preset.inputs.includes(input)) {
      delete preset.inputs[preset.inputs.indexOf(input)];
      let i: (string | null)[] = preset.inputs;
      preset.inputs = i.filter(this.notEmpty).sort(this.sortAlphaNum);
    }
  }

  // UpdateAudioDevices adds or removes the device from the list of audio devices depending on what boxes are checked.
  UpdateIndependentAudioDevices(preset: Preset, mic: string, checked: boolean) {
    if(checked && !preset.independentAudioDevices.includes(mic)) {
      preset.independentAudioDevices.push(mic);
      let d: (string | null)[] = preset.independentAudioDevices;
      preset.independentAudioDevices = d.filter(this.notEmpty).sort(this.sortAlphaNum);
    }

    if(!checked && preset.independentAudioDevices.includes(mic)) {
      delete preset.independentAudioDevices[preset.independentAudioDevices.indexOf(mic)];
      let d: (string | null)[] = preset.independentAudioDevices;
      preset.independentAudioDevices = d.filter(this.notEmpty).sort(this.sortAlphaNum);
    }
  }

  // ToggleSharing adds or removes sharing from the panel.
  ToggleSharing(canShare: boolean) {
    this.data.panels.forEach(pan => {
      if(canShare && !pan.features.includes("share")) {
        pan.features.push("share");
      }
      else if(!canShare && pan.features.includes("share")) {
        delete pan.features[pan.features.indexOf("share")];
        let f: (string | null)[] = pan.features;
        pan.features = f.filter(this.notEmpty).sort(this.sortAlphaNum);
      }
    })
  }

  CreateInputTypeMap() {
    this.InputTypeMap = new Map();

    this.data.config.inputConfiguration.forEach(input => {
      this.data.devices.forEach(dev => {
          if(dev.name === input.name && this.data.types.get(dev.type._id).input) {
            if(this.InputTypeMap.get(dev.type._id) == null) {
              let inputs: IOConfiguration[] = [];
              inputs.push(input);
              this.InputTypeMap.set(dev.type._id, inputs);
            }
            else {
              this.InputTypeMap.get(dev.type._id).push(input);
            }
          }
      });
    });
  }

  GetInputs(type: DeviceType): IOConfiguration[] {
    return this.InputTypeMap.get(type._id);
  }

  // InputAndTypeMatch takes the name of the input and the ID of the device type and returns if that input is a device of the given type.
  DeviceAndTypeMatch(inputName: string, typeID: string): boolean {
    for(let i = 0; i < this.data.devices.length; i++) {
      if(this.data.devices[i].name === inputName && this.data.devices[i].type._id === typeID) {
        return true;
      }
    }

    return false;
  }

  DeviceHasRole(inputName: string, roleID: string): boolean {
    for(let i = 0; i < this.data.devices.length; i++) {
      if(this.data.devices[i].name === inputName) {
        return this.HasRole(this.data.devices[i], roleID)
      }
    }
  }

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
}
