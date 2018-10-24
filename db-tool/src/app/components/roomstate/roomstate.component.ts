import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SmeeComponent } from '../smee.component';
import { Device } from '../../objects.ts';

@Component({
  selector: 'app-roomstate',
  templateUrl: './roomstate.component.html',
  styleUrls: ['./roomstate.component.scss']
})
export class RoomStateComponent implements OnInit, SmeeComponent {
  @Input() data;
  deviceList : Device[];
  deviceColumns : string[] = ["name", "description", "address"];
  constructor(private api: ApiService) { }

  ngOnInit() {
    this.GetDeviceList();
  }
  GetDeviceList() {
    this.api.GetDeviceList(this.data._id).subscribe(val => {
      this.deviceList = val;
    })
  } 
}
