import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { APIService } from './api.service';

@Component({
	selector: 'configuration',
	templateUrl: './configuration.component.html',
	providers: [APIService],
})

export class ConfigurationComponent implements OnInit {
	configuration: Object;
	DeviceTypes: Object;
	PowerStates: Object;
	Ports: Object;
	Commands: Object;
	Microservices: Object;
	Endpoints: Object;
	DeviceRoleDefinitions: Object;

	ngOnInit(): void {
		this.getConfig();	
	}

	constructor(private api: APIService) {}

	getConfig(): void {
		this.api.getConfig().subscribe(val => this.configuration = val);	
	}
}
