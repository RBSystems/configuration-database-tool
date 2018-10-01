export class Building {
    _id?: string;
    _rev?: string;
    name?: string;
    description?: string;
    tags?: string[]; 

    constructor(b?: Building) {
        this.tags = [];

        if(b != null) {
            this._id = b._id;
            this._rev = b._rev;
            this.name = b.name;
            this.description = b.description;
            this.tags = b.tags;
        }
    }

    Validate(): boolean {
        if(this._id == null || this._id.length < 1) {
            return false;
        }

        if(this.name == null || this.name.length < 1) {
            return false;
        }

        return true;
    }
}

export class Room {
    _id?: string;
    _rev?: string;
    name?: string;
    description?: string;
    configuration?: RoomConfiguration;
    designation?: string;
    devices?: Device[];
    tags?: string[];

    constructor(r?: Room) {
        this.tags = [];
        this.designation = "production";

        if(r != null) {
            this._id = r._id;
            this._rev = r._rev;
            this.name = r.name;
            this.description = r.description;
            this.configuration = r.configuration;
            this.designation = r.designation;
            this.devices = r.devices;
            this.tags = r.tags;
        }
    }

    Validate(): boolean {
        if(this._id == null || this._id.length < 3) {
            return false;
        }

        if(this.name == null || this.name.length < 1) {
            return false;
        } 

        if(this.configuration == null || this.configuration._id == null || this.configuration._id.length < 1) {
            return false;
        }

        if(this.designation == null || this.designation.length < 1) {
            return false;
        }

        return true;
    }
}

export class RoomConfiguration {
    _id?: string;
    tags?: string[];
}

export class Device {
    _id?: string;
    _rev?: string;
    name?: string;
    address?: string;
    description?: string;
    display_name?: string;
    type?: DeviceType;
    roles?: Role[];
    ports?: Port[];
    tags?: string[];

    constructor(baseType?: DeviceType) {
        this.roles = [];
        this.tags = [];
        this.type = new DeviceType();

        if(baseType != null) {
            this.type._id = baseType._id;
            
            if(baseType.ports != null) {
                this.ports = [];
                baseType.ports.forEach(port => {
                    let p = new Port();
                    p._id = port._id;
                    p.description = port.description;
                    p.friendly_name = port.friendly_name;
                    p.source_device = port.source_device;
                    p.tags = [];
                    this.ports.push(p)
                });
            }
            
            baseType.roles.forEach(role => {
                let r = new Role();
                r._id = role._id;
                r.description = role.description;
                r.tags = [];
                this.roles.push(r);
            })
        }
    }
}

export class DeviceType {
    _id?: string;
    description?: string;
    display_name?: string;
    input?: boolean;
    output?: boolean;
    source?: boolean;
    destination?: boolean;
    roles?: Role[];
    ports?: Port[];
    tags?: string[];
}

export class Role {
    _id?: string;
    description?: string;
    tags?: string[];
}

export class Port {
    _id?: string;
    friendly_name?: string;
    source_device?: string;
    destination_device?: string;
    description?: string;
    tags?: string[];
}

export class Template {
    _id?: string;
    description?: string;
    uiconfig?: UIConfig;
    devices?: Device[];
}

export class UIConfig   {
	_id?: 				  string
	_rev?:                string            
	api?:                 string[] = ["localhost"];     
	panels?:              Panel[] = [];    
	presets?:             Preset[] = [];
	inputConfiguration?:  IOConfiguration[] = [];
	outputConfiguration?: IOConfiguration[] = [];
    audioConfiguration?:  AudioConfiguration[] = [];
}

export class Preset   {
	name?:                    string  
	icon?:                    string  
	displays?:                string[] = [];
	shareableDisplays?:       string[] = [];
	audioDevices?:            string[] = [];
	inputs?:                  string[] = [];
    independentAudioDevices?: string[] = [];
}

export class Panel   {
	hostname?: string   
	uipath?:   string   
	preset?:   string   
	features?: string[] = [];
}

export class AudioConfiguration   {
	display?:      string   
	audioDevices?: string[] = [];
	roomWide?:     boolean     
}

export class IOConfiguration   {
	name?: string 
	icon?: string 
}

export class BulkUpdateResponse {
    _id?: string;
    success?: boolean;
    message?: string;
}

export class Group {
    preset?: Preset = new Preset();
    devices?: Device[] = [];
}