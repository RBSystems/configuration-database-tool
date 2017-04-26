import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/map';

@Injectable()
export class APIService {
	private url = 'http://localhost:9999';

	constructor (private http: Http) {}

	getBuildings(): Observable<Object> {
		return this.http.get(this.url + "/buildings")
						.map(response => response.json());
	}	

	getRooms(building: string): Observable<Object> {
		return this.http.get(this.url + "/buildings/" + building + "/rooms/")
						.map(response => response.json());
	}

	getDevices(building: string, room: string): Observable<Object> {
		return this.http.get(this.url + "/buildings/" + building + "/rooms/" + room)
						.map(response => response.json());
	}

	getConfig(): Observable<Object> {
		return this.http.get(this.url + "/configuration")
						.map(response => response.json());
	}
}
