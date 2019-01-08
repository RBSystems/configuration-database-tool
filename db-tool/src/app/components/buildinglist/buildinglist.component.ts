import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/api.service';
import { ModelService } from 'src/app/services/model.service';
import { Building } from 'src/app/objects';

@Component({
  selector: 'home',
  templateUrl: './buildinglist.component.html',
  styleUrls: ['./buildinglist.component.scss']
})
export class BuildingListComponent implements OnInit {
  buildingList: Building[] = [];
  searchQuery: string;
  filteredBuildings: Building[] = [];

  constructor(public api: APIService, public model: ModelService) {
    setTimeout(() => {
      this.filteredBuildings = model.campusBuildingList;
      console.log(this.filteredBuildings);
    }, 2000);

    
  }

  ngOnInit() {
  }

  Search() {
    this.filteredBuildings = [];

    if(this.searchQuery == null || this.searchQuery.length == 0) {
      this.filteredBuildings = this.buildingList;
      return;
    }

    this.buildingList.forEach(bldg => {
      if(bldg.id.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredBuildings.includes(bldg)) {
        this.filteredBuildings.push(bldg);
      }
      if(bldg.description.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredBuildings.includes(bldg)){
        this.filteredBuildings.push(bldg);
      } 
      if(bldg.name.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredBuildings.includes(bldg)) {
        this.filteredBuildings.push(bldg);
      }

      if(bldg.tags != null) {
        bldg.tags.forEach(tag => {
          if(tag.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredBuildings.includes(bldg)) {
            this.filteredBuildings.push(bldg);
          }
        });
      }
    });
  }
}
