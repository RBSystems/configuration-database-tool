import { Component, OnInit, Input } from '@angular/core';
import { Strings } from '../strings.service';
import { MatDialog } from '@angular/material';
import { Building, Room, Device, Template, UIConfig, Panel, IOConfiguration, DeviceType, Preset } from '../objects';
import { ModalComponent, MessageType, Result } from '../modal/modal.component';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {
  @Input() config: UIConfig;
  @Input() panel: Panel;
  @Input() preset: Preset;
  @Input() displays: IOConfiguration[] = [];
  @Input() inputs: IOConfiguration[] = [];
  @Input() deviceTypes: DeviceType[] = [];
  @Input() deviceList: Device[] = [];
  @Input() mics: IOConfiguration[] = [];

  currentIOCaller: IOConfiguration;
  currentPresetCaller: Preset;

  initialPreset: string;
  initialUIPath: string;
  initialFeatures: string[];

  InputDeviceTypes: DeviceType[] = [];

  NumRegex = /[0-9]/;

  constructor(public S: Strings, public dialog: MatDialog) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if(this.panel != null) {
      this.initialPreset = this.panel.preset;
      this.initialUIPath = this.panel.uipath;
      this.initialFeatures = this.panel.features;
    }
    if(this.deviceTypes != null && this.deviceTypes.length > 0) {
      this.InputDeviceTypes = [];
      this.deviceTypes.forEach(type => {
        this.config.inputConfiguration.forEach(io => {
          if(this.InputAndTypeMatch(io.name, type._id) && !this.InputDeviceTypes.includes(type)) {
            this.InputDeviceTypes.push(type);
          }
        });
      });
    }
    // if(this.config.presets.length == 0 && this.preset != null) {
    //   this.config.presets.push(this.preset)
    // }
  }

  // UpdatePresetDisplays adds or removes the device from the list of displays that this preset controls depending on what boxes are checked.
  UpdatePresetDisplays(preset: Preset, display: string, checked: boolean) {
    console.log(checked);
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

      console.log(preset);
      // console.log(this.config);
    }
  }

  // UpdateShareableDisplays adds or removes the device from the list of shareable displays depending on what boxes are checked.
  UpdateShareableDisplays(preset: Preset, display: string, checked: boolean) {
    console.log(checked);
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

      console.log(preset);
      // console.log(this.config);
    }
  }

  // UpdateAudioDevices adds or removes the device from the list of audio devices depending on what boxes are checked.
  UpdateAudioDevices(preset: Preset, display: string, checked: boolean) {
    console.log(checked);
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
    console.log(checked);
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
    console.log(checked);
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

  // ChangeIcon opens a modal to pick from the list of icons.
  ChangeIcon(io?: IOConfiguration, preset?: Preset) {
    if(io != null) {
      this.currentIOCaller = io;
      this.openDialog(MessageType.Icons, "", "io");
    }
    if(preset != null) {
      this.currentPresetCaller = preset;
      this.openDialog(MessageType.Icons, "", "preset");
    }
  }

  // ToggleSharing adds or removes sharing from the panel.
  ToggleSharing(pan: Panel, canShare: boolean) {
    if(canShare && !pan.features.includes("share")) {
      pan.features.push("share");
      console.log(pan);
    }
    else if(!canShare && pan.features.includes("share")) {
      delete pan.features[pan.features.indexOf("share")];
      let f: (string | null)[] = pan.features;
      pan.features = f.filter(this.notEmpty).sort(this.sortAlphaNum);
      console.log(pan);
    }
  }

  // InputAndTypeMatch takes the name of the input and the ID of the device type and returns if that input is a device of the given type.
  InputAndTypeMatch(inputName: string, typeID: string): boolean {
    for(let i = 0; i < this.deviceList.length; i++) {
      if(this.deviceList[i].name === inputName && this.deviceList[i].type._id === typeID) {
        return true;
      }
    }

    return false;
  }

  AddPreset() {
    let add: boolean = true;
    this.preset.name = this.panel.preset;
    this.preset.icon = "tv";

    this.config.presets.forEach(pre => {
      if(pre != null && this.panel.preset === pre.name) {
        add = false;
      }
    });

    if(add) {
      this.config.presets.push(this.preset);
    }
  }

  // openDialog opens a modal from the Modal Component.
  openDialog(status: MessageType, subheader?: string, message?: string, results?: Result[]) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {type: status, subheader: subheader, message: message, results: results}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(message === "io" && result != null) {
        this.currentIOCaller.icon = result;
      }
      if(message === "preset" && result != null) {
        this.currentPresetCaller.icon = result;
      }
      console.log(this.config);
    });
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
}
