import { Component } from '@angular/core';

export class Building {
	id?: number;
	name: string;
	shortname: string;
	description: string;
}

export class Room {
	id?: number;
	name: string;
	description: string;
	building?: Building;
	devices?: Device[];
	configurationID: number;
	configuration?: RoomConfig;
	roomDesignation: string;
}

export class Device {
	id: number;
	name: string;
	address: string;
	input: boolean;
	output: boolean;
	building: Building;
	room: Room;
	type: string;
	power: string;
	roles: string[];
	responding: boolean;
}

export class RoomConfig {
	id: number;
	name: string;
	roomKey: string;
	description: string;
	roomInitKey: string;
	commands: Command[];
}

export class Configuration {
	DeviceTypes: DeviceType[];
	Powerstates: Powerstate[];
	Ports: Port[];
	Commands: Command[];
	Microservices: Microservice[];
	Endpoints: Endpoint[];
	DeviceRoleDefinitions: DeviceRoleDefinition[];
}

export class DeviceType {
	id: number;
	name: string;
	description: string;
}

export class Powerstate {
	id: number;
	name: string;
	description: string;
}

export class Port {
	id: number;
	name: string;
	description: string;
}

export class Command {
	id: number;
	name: string;
	description: string;
	priority: number;
}

export class Microservice {
	id: number;
	name: string;
	address: string;
	description: string;
}

export class Endpoint {
	id: number;
	name: string;
	path: string;
	description: string;
}

export class DeviceRoleDefinition {
	id: number;
	name: string;
	description: string;
}
