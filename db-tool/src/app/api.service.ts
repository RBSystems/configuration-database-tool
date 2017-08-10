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
						.map(
                            response => response.json()
                        );
	}

    getPortsByClass(deviceClass: string) {
        return this.http.get(this.url + "/classes/" + deviceClass + "/ports")
                       .map(
                           response => response.json()
                       );
    }

	getConfig(): Observable<Object> {
		return this.http.get(this.url + "/configuration")
						.map(response => response.json());
	}

	getRoomConfigs(): Observable<Object> {
		return this.http.get(this.url + "/roomconfigurations")
						.map(response => response.json());
	}

    getRoomDesignations(): Observable<Object> {
        return this.http.get(this.url + "/rooms/designations")
                        .map(response => response.json());

    }

    setRoomAttribute(attribute: string, value: string, deviceID: number, attributeType: string): Observable<Object> {
        let body = {"attributeName": attribute, "attributeValue": value, "deviceID": deviceID, "attributeType": attributeType}

        let url = "/devices/attribute"

        return this.putData(url, body)
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

    putData(urlExtension: string, data: any): Observable<Object> {
	   	let putUrl = this.url + urlExtension; 	
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		let options = new RequestOptions({ headers: headers });
		let body = JSON.stringify(data);

		console.log("posting: \n" + body);
		console.log("to " + putUrl);

		return this.http.put(putUrl, body, options).map((res: Response) => res.json());
    }
}
