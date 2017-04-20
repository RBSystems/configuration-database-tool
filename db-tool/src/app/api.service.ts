import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/map';

@Injectable()
export class APIService {
	private buildingsUrl = 'http://localhost:9999/buildings';

	constructor (private http: Http) {}

	getBuildings(): Observable<Object> {
		return this.http.get(this.buildingsUrl)
						.map(response => response.json());
	}	
}
