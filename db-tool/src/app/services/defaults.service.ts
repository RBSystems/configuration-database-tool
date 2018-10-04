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
        "PC": "desktop_windows",
        "ADCP Sony VPL": "videocam",
        "AppleTV": "airplay",
        "Aruba8PortNetworkSwitch": "storage",
        "Blu50": "speaker",
        "ChromeCast": "cast",
        "Computer": "desktop_windows",
        "Crestron RMC-3 Gateway": "call_merge",
        "DM-MD16x16": "accessible_forward",
        "DividerSensors": "leak_add",
        "FunnelGateway": "call_merge",
        "JAP3GRX": "flip_to_back",
        "JAP3GTX": "flip_to_front",
        "Kramer VS-44DT": "dns",
        "Pi3": "touch_app",
        "PulseEight8x8": "dns",
        "QSC-Core-110F": "speaker",
        "SchedulingPanel": "calendar_today",
        "ShureULXD": "router",
        "SonyPHZ10": "videocam",
        "VideoCard": "tv",
        "non-controllable": "settings_input_hdmi",
        "via-connect-pro": "settings_input_antenna"
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

    DefaultDeviceNames = {
        "ADCP Sony VPL": "D",
        "AppleTV": "AppleTV",
        "Aruba8PortNetworkSwitch": "NS",
        "Blu50": "DSP",
        "ChromeCast": "ChromeCast",
        "Computer": "PC",
        "Crestron RMC-3 Gateway": "GW",
        "DM-MD16x16": "SW",
        "DividerSensors": "DS",
        "FunnelGateway": "GW",
        "JAP3GRX": "AVIPRX",
        "JAP3GTX": "AVIPTX",
        "Kramer VS-44DT": "SW",
        "Pi3": "CP",
        "PulseEight8x8": "SW",
        "QSC-Core-110F": "DSP",
        "SchedulingPanel": "SP",
        "ShureULXD": "RCV",
        "SonyPHZ10": "D",
        "SonyXBR": "D",
        "SonyVPL": "D",
        "Shure Microphone": "MIC",
        "VideoCard": "D",
        "non-controllable": "HDMI",
        "via-connect-pro": "VIA"
    }
}