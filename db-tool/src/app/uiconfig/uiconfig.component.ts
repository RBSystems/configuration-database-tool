import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ApiService } from '../api.service';
import { Strings } from '../strings.service';
import { Building, Room, Device, Template, UIConfig, Panel, IOConfiguration, DeviceType, Preset } from '../objects';
import { ModalComponent, MessageType, Result } from '../modal/modal.component';
import { Defaults } from '../defaults.service';

@Component({
  selector: 'app-uiconfig',
  templateUrl: './uiconfig.component.html',
  styleUrls: ['./uiconfig.component.scss']
})
export class UIConfigComponent implements OnInit {
  @Input() building: Building = new Building();
  @Input() room: Room = new Room();
  buildingList: Building[] = [];
  roomList: Room[] = [];
  @Input() deviceList: Device[] = [];
  typeList: DeviceType[] = [];
  deviceTypeMap: Map<string, DeviceType> = new Map();
  panels: Panel[] = [];
  displays: IOConfiguration[] = [];
  inputs: IOConfiguration[] = [];
  indyAudios: IOConfiguration[] = [];
  templateList: Template[] = [];
  @Input() currentTemplate: Template;
  customTemplate: Template = new Template();
  blankTemplate: Template = new Template();
  config: UIConfig;
  blankConfig: UIConfig = new UIConfig();
  configExists: boolean = false;
  panelStep: number = 0;

  UserHasAdminRights: boolean;
  @Input() InStepper: boolean = false;

  NumRegex = /[0-9]/;

  constructor(private api: ApiService, public dialog: MatDialog, public S: Strings, public D: Defaults) { }

  ngOnInit() {
    // this.api.HasAdminRights().subscribe(val => {
    //   this.UserHasAdminRights = val;
    // });
    if(!this.InStepper) {
      // this.currentTemplate = new Template();
    }

    this.customTemplate._id = "Custom";
    this.getBuildingList();
    this.getTemplateList();
    this.getDeviceTypeList();
  }

  ngOnChanges() {
    if(this.currentTemplate != null && this.currentTemplate._id != null) {
      console.log(this.currentTemplate)
      this.UpdatePanels();
    }
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

      this.typeList.forEach(type => {
        this.deviceTypeMap.set(type._id, type);
      })
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

      this.SetIOConfigurations();
      
      
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

  SetIOConfigurations() {
    if(this.config.inputConfiguration == null || this.config.inputConfiguration.length == 0) {
      this.config.inputConfiguration = [];
    }
    if(this.config.outputConfiguration == null || this.config.outputConfiguration.length == 0) {
      this.config.outputConfiguration = [];
    }
  
    this.deviceList.forEach(d => {
      let index = d.name.search(this.NumRegex)
      let NameSansNum: string = d.name.substring(0, index);
  
      let t = this.deviceTypeMap.get(d.type._id);
      // Find all the ControlProcessors and make a Panel for each.
      if(this.VerifyTypeHasRole(t, "ControlProcessor")) {
        let p = new Panel();
        p.hostname = d._id;

        let add = true;
  
        this.panels.forEach(pan => {
          if(pan.hostname === p.hostname) {
            add = false;
          }
        });
  
        if(add) {
          this.panels.push(p);
        }
      }
  
      let io = new IOConfiguration();
  
      // Find all the inputs and make an IOConfiguration for each.
      if(t.input) {
        io.name = d.name;
        io.icon = this.D.DefaultIcons[NameSansNum];
        this.inputs.push(io);
  
        if(!this.IOIsInList(io.name, this.config.inputConfiguration)) {
          this.config.inputConfiguration.push(io);
        } 
      }
  
      // Find the displays and make an IOConfiguration for each.
      if(t.output && this.VerifyTypeHasRole(t, "VideoOut")) {
        io.name = d.name;
        io.icon = this.D.DefaultIcons[d.type._id];
        this.displays.push(io);
  
        if(!this.IOIsInList(io.name, this.config.outputConfiguration)) {
          this.config.outputConfiguration.push(io);
        }              
      }
  
      // Find the independent audio devices and add them to the list.
      if(this.VerifyTypeHasRole(t, "Microphone")) {
        io.name = d.name;
        io.icon = this.D.DefaultIcons[d.type._id];
        this.indyAudios.push(io);
  
        if(!this.IOIsInList(io.name, this.config.inputConfiguration)) {
          this.config.outputConfiguration.push(io);
        }  
      }
    });
  }

  IOIsInList(nameToCheck: string, listToCheck: IOConfiguration[]): boolean {
    if(listToCheck == null) {return false;}

    for(let i = 0; i < listToCheck.length; i++) {
      if(listToCheck[i].name === nameToCheck) {
        return true;
      }
    }
    return false;
  }

  UpdatePanels() {
    if(this.currentTemplate._id === "Custom") {
      this.customTemplate.uiconfig = this.config;
      this.customTemplate.uiconfig.panels = this.panels;
    }

    this.config = this.currentTemplate.uiconfig;

    this.SetIOConfigurations();
    
    console.log(this.panels)
    for(let i = 0; i < this.panels.length; i++) {
      if(i < this.config.panels.length) {
        this.config.panels[i].hostname = this.panels[i].hostname;
      }
    }
    console.log(this.config);
  }

  GetPreset(presetID: string): Preset {
    let p = new Preset();
    this.config.presets.forEach(pre => {
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

  VerifyTypeHasRole(type: DeviceType, role: string): boolean {
    let match = false;

    type.roles.forEach(r => {
      if(r._id === role) {
        match = true;
      }
    });

    return match;
  }

  Submit() {
    console.log(this.config)
    console.log(this.configExists)
    if(this.configExists) {
      this.UpdateUIConfig();
    }
    else {
      this.CreateUIConfig();
    }
  }

  Delete() {

  }

  CreateUIConfig() {
    let res: Result[] = [];
    this.api.AddUIConfig(this.room._id, this.config).subscribe(
      success => {
        res.push({message: "Successfully added a UI Config for " + this.room._id + ".", success: true });
        this.openDialog(MessageType.Success, "UI Config Added", null, res);
        this.configExists = true;
      },
      error => {
        let errorMessage = this.S.ErrorCodeMessages[error.status]

        res.push({message: error.json(), success: false, error: error});
        this.openDialog(MessageType.Error, errorMessage, null, res);
      });
  }

  UpdateUIConfig() {
    let res: Result[] = [];
    this.api.UpdateUIConfig(this.room._id, this.config).subscribe(
      success => {
        res.push({message: "Successfully updated the UI Config for " + this.room._id + ".", success: true });
        this.openDialog(MessageType.Success, "UI Config Updated", null, res);
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

  setStep(index: number) {
    this.panelStep = index;
  }

  nextStep() {
    this.panelStep++;    
  }

  prevStep() {
    this.panelStep--;
  }

  arrayToString(array: string[]) {
    if(array.length == 0) {
      return "None";
    }
    return array.join(", ");
  }
}
