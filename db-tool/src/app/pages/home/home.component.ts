import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Building } from '../../objects';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  buildingList: Building[] = [];
  searchQuery: string;
  filteredBuildings: Building[] = [];

  constructor(private api: ApiService, public dialog: MatDialog) { }

  ngOnInit() {
    this.GetBuildingList();
  }

  Search() {
    this.filteredBuildings = [];

    if(this.searchQuery == null) {
      this.filteredBuildings = this.buildingList;
      return;
    }

    this.buildingList.forEach(bldg => {
      if(bldg._id.toLowerCase().includes(this.searchQuery.toLowerCase()) && !this.filteredBuildings.includes(bldg)) {
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

  ///// API FUNCTIONS /////
  GetBuildingList() {
    this.buildingList = [];
    this.filteredBuildings = [];

    this.api.GetBuildingList().subscribe(val => {
      this.buildingList = val;
      console.log(this.buildingList);
      this.filteredBuildings = this.buildingList;
    });
  }
}
