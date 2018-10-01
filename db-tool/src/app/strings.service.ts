import { Injectable } from "@angular/core";
import { TooltipPosition } from '@angular/material';

@Injectable()
export class Strings {
    Fast = 300;
    Slow = 750;
    VerySlow = 1000;

    positionList: TooltipPosition[] = [
        'above',
        'after',
        'before',
        'below',
        'left',
        'right'
    ];

    positions = {
        "above": this.positionList[0],
        "after": this.positionList[1],
        "before": this.positionList[2],
        "below": this.positionList[3],
        "left": this.positionList[4],
        "right": this.positionList[5]
    }

    Links = [
        "home", 
        "walkthrough", 
        "building", 
        "room", 
        "device",
        "uiconfig",
        "summary",
        // "dnd"
    ];

    LinkTitles = {
        "home": "Home", 
        "walkthrough": "Walkthrough", 
        "building": "Building", 
        "room": "Room", 
        "device": "Device", 
        "uiconfig": "UI Config",
        "summary": "Summary",
        // "dnd": "Room Builder Beta"
    }

    HomeTips = {
        "home": "Go to the home page",
        "walkthrough": "Go through the full setup process",
        "building": "Add/Edit a Building",
        "room": "Add/Edit a Room",
        "device": "Add/Edit a Device",
        "uiconfig": "Add/Edit a UI Config",
        "summary": "View all the information for a room, its devices, and its ui configuration"
    }

    BuildingTips = {
        "id": "The building acronym. ex: HRCB",
        "name": "ex: Harold R. Clark Building",
        "description": "ex: The Kennedy Center",
        "create": "Add this building to the database",
        "update": "Update this building in the database",
        "list": "Choose a building from the list"
    }

    RoomTips = {
        "id": "ex: HFAC-D400",
        "name": "ex: HFAC-D400 (Madsen)",
        "description": "ex: Madsen Recital Hall",
        "configuration": "How the devices are set up in this room",
        "designation": "What this room is used for",
        "bldg_list": "Choose from the list of buildings",
        "room_list": "Choose from the list of rooms in the building",
        "create": "Add this room to the database",
        "update": "Update this room in the database"
    }

    DeviceStrings = {
        "type_roles": "Required roles",
        "mirror": "Does this display always mirror another?"
    }

    DeviceTips = {
        "id": "READ ONLY! The part after the second hyphen is whatever the device name is.",
        "name": "ex: D1\nCP1\nHDMI1",
        "description": "ex: Sony TV",
        "roles": "What this device does in this room",
        "address": "Hostname, IP, or 0.0.0.0",
        "type": "The specific type, or non-controllable",
        "display_name": "The name that shows on the touchpanel",
        "ports_open": "Inputs and outputs on the device. Click to expand",
        "ports_close": "Inputs and outputs on the device. Click to collapse",
        "port_id": "The name that the device calls this port",
        "friendly_name": "The name that you want to call this port",
        "source_device": "What device comes in to this port",
        "destination_device": "What device does this port go out to",
        "bldg_list": "Choose from the list of buildings",
        "room_list": "Choose from the list of rooms in the building",
        "device_list": "Choose from the list of devices in the room",
        "create": "Add this device to the database",
        "update": "Update this device in the database"
    }

    UIStrings = {
        "slave?": "Does this panel mirror another one?",
        "master?": "Which panel should this one mirror?",
        "no preset": "N/A"
    }

    UITips = {
        "bldg_list": "Choose from the list of buildings",
        "room_list": "Choose from the list of rooms in the building",
        "submit": "Submit this UI Config to the database",
        "delete": "Delete this UI Config from the database"
    }

    UIPaths = {
        "/blueberry": {
            "title": "Blueberry",
            "description": "(wheel UI)"
        },
        "/cherry": {
            "title": "Cherry",
            "description": "(multi-display, dark UI)" 
        }  
    }

    UISharing = {
        true: "Sharing enabled",
        false: "Sharing disabled"
    }

    

    Icons = [
        "tv",
        "videocam",
        "settings_input_antenna",
        "settings_input_hdmi",
        "airplay",
        "hd",
        "add_to_queue",
        "video_label",
        "wifi_tethering",
        "usb",
        "cast",
        "computer",
        "desktop_mac",
        "desktop_windows",
        "laptop_chromebook",
        "phone_android",
        "videogame_asset",
        "switch_video",
        "ondemand_video",
        "tap_and_play",
        "share",
        "mic",
        "people"
    ]

    ErrorCodeMessages = {
        500: "Something is wrong internally...",
        409: "Item Already Exists",
        404: "Item Does Not Exist",
        403: "Action Not Allowed",
        400: "Incorrect Information Sent",
    }
}