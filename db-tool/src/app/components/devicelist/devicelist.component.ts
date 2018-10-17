import { Component, OnInit } from '@angular/core';
import { SmeeComponent } from '../smee.component';
import { Device } from '../../objects';
import { ApiService } from '../../services/api.service';
import { Strings } from '../../services/strings.service';

@Component({
  selector: 'app-devicelist',
  templateUrl: './devicelist.component.html',
  styleUrls: ['./devicelist.component.scss']
})
export class DeviceListComponent implements OnInit, SmeeComponent {
  data: Device[];

  constructor(private api: ApiService, public S: Strings) { }

  ngOnInit() {
  }

}
