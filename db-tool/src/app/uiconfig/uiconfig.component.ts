import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-uiconfig',
  templateUrl: './uiconfig.component.html',
  styleUrls: ['./uiconfig.component.css']
})
export class UIConfigComponent implements OnInit {

  constructor(private api: ApiService) { }

  ngOnInit() {
  }

}
