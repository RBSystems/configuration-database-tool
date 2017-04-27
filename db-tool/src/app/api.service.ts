import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
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

	getRoomConfigs(): Observable<Object> {
		return this.http.get(this.url + "/roomconfigurations")
						.map(response => response.json());
	}

	postData(urlExtension: string, data: any) {
	   	let postUrl = this.url + urlExtension; 	
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		let options = new RequestOptions({ headers: headers });
		let body = JSON.stringify(data);

		console.log("posting: \n" + body);
		console.log("to " + postUrl);

		return this.http.post(postUrl, body, options).map((res: Response) => res.json());
	}
}
