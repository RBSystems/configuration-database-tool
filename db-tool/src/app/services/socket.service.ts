import { Injectable, EventEmitter } from '@angular/core';
import { JsonConvert, JsonObject, JsonProperty, JsonCustomConvert, JsonConverter, Any } from 'json2typescript';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: WebSocket;
  private converter: JsonConvert;

  private listener: EventEmitter<Event>;

  constructor() {
    this.converter = new JsonConvert();
    this.converter.ignorePrimitiveChecks = false;
    this.listener = new EventEmitter();

    this.openSocket();
  }

  private openSocket() {
    this.socket = new WebSocket(
      "ws://" + window.location.host + "/ws"
    );

    this.socket.onopen = () => {
      console.log("socket connection successfully opened.");
    };

    this.socket.onmessage = message => {
      const data = JSON.parse(message.data);
      const event = this.converter.deserialize(data, Event);

      this.onEvent(event);
    };

    this.socket.onclose = () => {
      console.log("socket connection closed. retrying in 5 seconds...");
      setTimeout(() => {
        this.openSocket();
      }, 5 * 1000);
    };
  }

  private onEvent(event: Event) {
    console.log("received event:", event);
    this.listener.emit(event);
  }

  public getListener(): EventEmitter<Event> {
    return this.listener;
  }
}

@JsonObject("BasicRoomInfo")
export class BasicRoomInfo {
  @JsonProperty("buildingID", String, true)
  BuildingID = "";

  @JsonProperty("roomID", String, true)
  RoomID = "";

  constructor(roomID: string) {
    if (roomID == null || roomID === undefined) {
      return;
    }

    const split = roomID.split("-");

    if (split.length === 2) {
      this.BuildingID = split[0];
      this.RoomID = split[0] + "-" + split[1];
    }
  }
}

@JsonObject("BasicDeviceInfo")
export class BasicDeviceInfo {
  @JsonProperty("buildingID", String, true)
  BuildingID = "";

  @JsonProperty("roomID", String, true)
  RoomID = "";

  @JsonProperty("deviceID", String, true)
  DeviceID = "";

  constructor(deviceID: string) {
    if (deviceID == null || deviceID === undefined) {
      return;
    }

    const split = deviceID.split("-");

    if (split.length === 3) {
      this.BuildingID = split[0];
      this.RoomID = split[0] + "-" + split[1];
      this.DeviceID = split[0] + "-" + split[1] + "-" + split[2];
    }
  }
}

@JsonConverter
class DateConverter implements JsonCustomConvert<Date> {
  serialize(date: Date): any {
    function pad(n) {
      return n < 10 ? "0" + n : n;
    }

    return (
      date.getUTCFullYear() +
      "-" +
      pad(date.getUTCMonth() + 1) +
      "-" +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      ":" +
      pad(date.getUTCMinutes()) +
      ":" +
      pad(date.getUTCSeconds()) +
      "Z"
    );
  }

  deserialize(date: any): Date {
    return new Date(date);
  }
}

@JsonObject("Event")
export class Event {
  @JsonProperty("generating-system", String, true)
  GeneratingSystem = "";

  @JsonProperty("timestamp", DateConverter, true)
  Timestamp: Date = undefined;

  @JsonProperty("event-tags", [String], true)
  EventTags: string[] = [];

  @JsonProperty("target-device", BasicDeviceInfo, true)
  TargetDevice = new BasicDeviceInfo(undefined);

  @JsonProperty("affected-room", BasicRoomInfo, true)
  AffectedRoom = new BasicRoomInfo(undefined);

  @JsonProperty("key", String, true)
  Key = "";

  @JsonProperty("value", String, true)
  Value = "";

  @JsonProperty("user", String, true)
  User = "";

  @JsonProperty("data", Any, true)
  Data: any = undefined;

  public hasTag(tag: string): boolean {
    return this.EventTags.includes(tag);
  }
}

