import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SmeeComponent } from '../smee.component';
import { Device, DeviceType } from '../../objects';
import { Defaults } from '../../services/defaults.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
})
export class DeviceComponent implements OnInit, SmeeComponent {
  @Input() data;
  @Input() device: Device;
  @Input() deviceExists: boolean;
  @Input() devicesInRoom: Device[];
  @Input() deviceTypeList: Device[];
  @Input() deviceTypeMap: Map<string, DeviceType>;
  alerts: string[] = [];

  constructor(private api: ApiService, public D: Defaults, public M: ModalService) { }

  ngOnInit() {
  }

  OpenDeviceModal() {
    this.M.OpenDeviceModal(this.device, this.devicesInRoom, this.deviceTypeMap, this.deviceTypeList, this.deviceExists);
  }
}
