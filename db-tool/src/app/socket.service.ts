import { Injectable, EventEmitter } from '@angular/core'
import { $WebSocket, WebSocketConfig } from 'angular2-websocket/angular2-websocket'
import { Time } from '@angular/common';

export const OPEN: string = "open";
export const CLOSE: string = "close";
export const MESSAGE: string = "message";

@Injectable()
export class SocketService {
  private url: string;

  private socket: $WebSocket;
  private listener: EventEmitter<any>;
  private webSocketConfig: WebSocketConfig = {
 	initialTimeout: 100,
    maxTimeout: 500,
	reconnectIfNotNormalClose: true	
  }


    public constructor() {
	this.url = "wss://" + location.hostname + ":9999/websocket";
	this.socket = new $WebSocket(this.url, null, this.webSocketConfig); 
	this.listener = new EventEmitter(); 

	this.socket.onMessage(msg => { 
    let event: Event = JSON.parse(msg.data);
    this.listener.emit({ "type": MESSAGE, "data": event});
	 
	  }, {autoApply: false} 
	); 

	this.socket.onOpen((msg) => { 
		console.log("Websocket opened with", this.url ,":", msg);	
		this.listener.emit({"type": OPEN});
	});

	this.socket.onError((msg) => { 
		console.log("websocket closed.", msg);	
		this.listener.emit({"type": CLOSE}); 
	});

	this.socket.onClose((msg) => {
		console.log("trying again", msg);	
	}); 
  }

  public close() {
    this.socket.close(false);
  }

  public getEventListener() {
    return this.listener;
  }
}

export class BasicRoomInfo {
  buildingID: string;
  roomID: string;
}

export class BasicDeviceInfo {
  buildingID: string;
  roomID: string;
  deviceID: string;
}

export class Event {
  generating_system?: string;
  timestamp?: Time;
  event_tags?: string[];
  target_device?: BasicDeviceInfo;
  affected_room?: BasicRoomInfo;
  key?: string;
  value?: string;
  user?: string;
  data?: any;
}