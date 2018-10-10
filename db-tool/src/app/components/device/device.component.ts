import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SmeeComponent } from '../smee.component';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
})
export class DeviceComponent implements OnInit, SmeeComponent {
  @Input() data;

  constructor(private api: ApiService) { }

  ngOnInit() {
  }

}
