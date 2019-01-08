import { Component, OnInit, Input } from '@angular/core';
import { Building } from 'src/app/objects';
import { APIService } from 'src/app/services/api.service';
import { ModelService } from 'src/app/services/model.service';

@Component({
  selector: 'building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent implements OnInit {
  @Input() building: Building;
  @Input() buildingExists: boolean;

  constructor(public api: APIService, public model: ModelService) { }

  ngOnInit() {
  }

  GetImage(): string {
    return "../../assets/images/" + this.building.id + ".jpg"
  }

  OpenBuildingModal() {
    
  }
}
