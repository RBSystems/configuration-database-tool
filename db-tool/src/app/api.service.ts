import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class APIService {
	private buildingsUrl = 'localhost:9999/buildings';

	constructor (private http: Http) {}

	getBuildings(): Observable<Building[]> {
		return this.http.get(this.buildingsUrl)
						.map(this.extractData)
						.catch(this.handleError);
	}
}
