import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SmeeComponent } from '../smee.component';

@Component({
  selector: 'app-roomstate',
  templateUrl: './roomstate.component.html',
  styleUrls: ['./roomstate.component.scss']
})
export class RoomStateComponent implements OnInit, SmeeComponent {
  @Input() data;

  constructor(private api: ApiService) { }

  ngOnInit() {
  }

}
