import { Component } from '@angular/core';
import { APIService } from 'src/app/services/api.service';
import { ModelService } from 'src/app/services/model.service';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(public api: APIService, public model: ModelService, public text: StringsService) {
    this.activeLink = window.location.pathname.split("/", 2)[1];
  }

  activeLink: string = "";
}
