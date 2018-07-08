export class Building {
    _id?: string;
    _rev?: string;
    name?: string;
    description?: string;
    tags?: string[]; 

    constructor() {
        this.tags = [];
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

    constructor() {
        this.tags = [];
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

    constructor() {
        this.roles = [];
        this.tags = [];
    }
}

export class DeviceType {
    _id?: string;
    input?: boolean;
    output?: boolean;
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
    uiconfig?: UIConfig;
    devices?: Device[];
}

export class UIConfig   {
	_id?: 				  string
	_rev?:                string            
	api?:                 string[] = [];     
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

export class Tag {
    name: string
}