import { Injectable } from "@angular/core";
import { TooltipPosition } from '@angular/material';

@Injectable()
export class Defaults {

    DefaultIcons = {
        "SonyXBR": "tv",
        "SonyVPL": "videocam",
        "Shure Microphone": "mic",
        "HDMI": "settings_input_hdmi",
        "VIA": "settings_input_antenna",
        "PC": "desktop_windows"
    }

    DefaultPorts = {
        "SonyXBR": {
            "hdmi!1":  {
                "source":"bogus",
                "destination": "D"
            },
            "hdmi!2":  {
                "source":"HDMI",
                "destination": "D"
            },
            "hdmi!3":  {
                "source":"VIA",
                "destination": "D"
            },
            "hdmi!4":  {
                "source":"PC",
                "destination": "D"
            }
        },
        "ADCP Sony VPL": {
            "hdmi1": {
                "source":"HDMI",
                "destination":"D"
            },
            "hdbaset1": {
                "source":"VIA",
                "destination":"D"
            },
            "dvi1": {
                "source":"PC",
                "destination":"D"
            }
        }
    }

    DefaultAddress = {
        "non-controllable": "0.0.0.0"
    }

    DefaultDisplayName = {
        "non-controllable": "HDMI",
        "via-connect-pro": "VIA",
        "Pi3": "Pi",
        "SonyXBR": "Flatpanel",
        "Computer": "PC"
    }
}