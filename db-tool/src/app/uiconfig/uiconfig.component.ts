import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ApiService } from '../api.service';
import { Strings } from '../strings.service';
import { Building, Room, Device, Template, UIConfig, Panel, IOConfiguration, DeviceType, Preset } from '../objects';
import { ModalComponent, MessageType, Result } from '../modal/modal.component';

@Component({
  selector: 'app-uiconfig',
  templateUrl: './uiconfig.component.html',
  styleUrls: ['./uiconfig.component.scss']
})
export class UIConfigComponent implements OnInit {
  building: Building = new Building();
  room: Room = new Room();
  buildingList: Building[] = [];
  roomList: Room[] = [];
  deviceList: Device[] = [];
  typeList: DeviceType[] = [];
  panels: Panel[] = [];
  displays: IOConfiguration[] = [];
  inputs: IOConfiguration[] = [];
  templateList: Template[] = [];
  currentTemplate: Template = new Template();
  customTemplate: Template = new Template();
  config: UIConfig = new UIConfig();
  configExists: boolean = false;
  panelStep: number;
  currentIOCaller: IOConfiguration;
  currentPresetCaller: Preset;

  NumRegex = /[0-9]/;

  constructor(private api: ApiService, public dialog: MatDialog, public S: Strings) { }

  ngOnInit() {
    this.getBuildingList();
    this.getTemplateList();
    this.getDeviceTypeList();
  }

  getBuildingList() {
    this.buildingList = [];
    
    this.api.GetBuildingList().subscribe(val => {
      this.buildingList = val;
    });
  }

  getDeviceTypeList() {
    this.typeList = [];

    this.api.GetDeviceTypesList().subscribe(val => {
      this.typeList = val;
    });
  }

  getRoomList() {
    this.roomList = [];
    this.room = new Room();

    this.api.GetRoomList(this.building._id).subscribe(val => {
      this.roomList = val;
    });
  }

  getDeviceLists() {
    this.deviceList = [];
    this.panels = [];
    this.displays = [];
    this.inputs = [];

    this.api.GetDeviceList(this.room._id).subscribe(val => {
      this.deviceList = val;

      let AddToInputs: boolean = false;
      let AddToOutputs: boolean = false;
     
      if(this.config.inputConfiguration == null) {
        this.config.inputConfiguration = [];
        AddToInputs = true;
      }
      if(this.config.outputConfiguration == null) {
        this.config.outputConfiguration = [];
        AddToOutputs = true;
      }


      this.deviceList.forEach(d => {
        d.roles.forEach(role => {
          // Find all the ControlProcessors and make a Panel for each.
          if(role._id === "ControlProcessor") {
            let p = new Panel();
            p.hostname = d._id;
            this.panels.push(p);
          }
        });

        let index = d.name.search(this.NumRegex)
        let NameSansNum: string = d.name.substring(0, index);

        this.typeList.forEach(t => {
          if(d.type._id === t._id) {
            let io = new IOConfiguration();

            // Find all the inputs and make an IOConfiguration for each.
            if(t.input) {
              io.name = d.name;
              io.icon = this.S.DefaultIcons[NameSansNum];
              this.inputs.push(io);

              if(AddToInputs) {
                this.config.inputConfiguration.push(io);
              } 
            }

            // Find the displays and make an IOConfiguration for each.
            if(t.output && NameSansNum === "D") {
              io.name = d.name;
              io.icon = this.S.DefaultIcons[d.type._id];
              this.displays.push(io);

              if(AddToOutputs) {
                this.config.outputConfiguration.push(io);
              }              
            }
          }
        });
      });
    });
  }

  getUIConfig() {
    this.api.GetUIConfig(this.room._id).subscribe(val => {
      this.config = val;
      this.configExists = true;

      // Get the devices AFTER getting the UI Config
      this.getDeviceLists();
    },
    error => {
      this.configExists = false;

      // Get the devices AFTER getting the UI Config, even if it isn't there
      this.getDeviceLists();
    });
  }

  getTemplateList() {
    this.templateList = [];

    this.api.GetTemplates().subscribe(val => {
      this.templateList = val;
    })
  }

  UpdatePanels() {

  }

  GetPreset(presetID: string): Preset {
    let p = new Preset();
    this.config.presets.forEach(pre => {
      if(pre.name === presetID) {
        p = pre;
      }
    });

    return p;
  }

  UpdatePresetDisplays(preset: Preset, display: string, checked: boolean) {
    console.log(checked);
    if(checked && !preset.displays.includes(display)) {
      preset.displays.push(display);
      let d: (string | null)[] = preset.displays;
      preset.displays = d.filter(this.notEmpty).sort(this.sortAlphaNum);

      preset.audioDevices.push(display);
      let a: (string | null)[] = preset.audioDevices;
      preset.audioDevices = a.filter(this.notEmpty).sort(this.sortAlphaNum);

      console.log(preset);
    }

    if(!checked && preset.displays.includes(display)) {
      delete preset.displays[preset.displays.indexOf(display)];
      let d: (string | null)[] = preset.displays;
      preset.displays = d.filter(this.notEmpty).sort(this.sortAlphaNum);

      delete preset.audioDevices[preset.audioDevices.indexOf(display)];
      let a: (string | null)[] = preset.audioDevices;
      preset.audioDevices = a.filter(this.notEmpty).sort(this.sortAlphaNum);

      console.log(preset);
    }
  }

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

  openDialog(status: MessageType, subheader?: string, message?: string, results?: Result[]) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {type: status, subheader: subheader, message: message, results: results}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(message === "io") {
        this.currentIOCaller.icon = result;
      }
      if(message === "preset") {
        this.currentPresetCaller.icon = result;
      }
      console.log(this.config);
    });
  }

  setStep(index: number) {
    this.panelStep = index;
  }

  nextStep() {
    this.panelStep++;    
  }

  prevStep() {
    this.panelStep--;
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
