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
        "home"
    ];

    LinkTitles = {
        "home": "Home"
    }

    AddLink(link: string, title?: string) {
        if(!this.Links.includes(link)) {
            this.Links.push(link);
        }
        else {
            this.RemoveLink(link);
        }
        if(title != null) {
            this.LinkTitles[link] = title;
        }
    }

    RemoveLink(link?: string) {
        if(link == null && this.Links.length > 1) {
            this.Links.pop()
        }
        else if(link != null && this.Links.includes(link)) {
            let size = this.Links.length;
            for(let i = size; i > this.Links.indexOf(link)+1; i--) {
                this.Links.pop();
            }
        }
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

    HomeTips = {
        "home": "Go to the home page"
    }

    ActionList = [
        "Room State",
        "Room Builder"
    ]

    UIConfig = {
        true: "Sharing enabled",
        false: "Sharing disabled"
    }
}