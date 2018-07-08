import { Component, OnInit, Input } from '@angular/core';
import { Building, Tag } from '../objects'
import { ApiService } from '../api.service';
import { MatDialog } from '@angular/material';
import { ModalComponent } from '../modal/modal.component';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DBError } from '../home/home.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css']
})
export class BuildingComponent implements OnInit {
  @Input() InStepper: boolean = false;
  @Input() buildingExists: boolean = false;
  tagList: string[] = ["Red", "Yellow", "Blue"];
  tags: string[] = [];
  buildingList: Building[] = [];
  addBuilding: Building;
  @Input() editBuilding: Building;
  message: string;
  tabIndex: number = 0;

  buildingMatcher = new DBError();
  AddFormGroup: FormGroup;
  EditFormGroup: FormGroup;
  addIDFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern("[A-Z0-9]*")
  ]);
  editIDFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern("[A-Z0-9]*")
  ]);

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  // addBuilding.tags: Tag[] = [
  //   {name: 'Lemon'},
  //   {name: 'Lime'},
  //   {name: 'Apple'},
  // ];
  // addBuilding.tags: string[];
  // editBuilding.tags: string[];

  constructor(private api: ApiService, public dialog: MatDialog, private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.AddFormGroup = this._formBuilder.group({
      addIDCtrl: ['', Validators.required]
    });
    this.EditFormGroup = this._formBuilder.group({
      editIDCtrl: ['', Validators.required]
    });

    this.tabIndex = 0;
    this.addBuilding = new Building();
    this.editBuilding = new Building();
    this.getBuildingList();
    // this.addBuilding.tags = this.addBuilding.tags;
    // this.editBuilding.tags = this.editBuilding.tags;
  }

  ngOnChanges() {
    if(this.InStepper && this.buildingExists) {
      this.tabIndex = 1;
    }
    else {
      this.tabIndex = 0;
    }
  }

  getBuildingList() {
    this.buildingList = [];
    this.api.GetBuildingList().subscribe(val => {
      this.buildingList = val;
    });
  }

  CreateBuilding() {
    console.log(this.addBuilding);
    this.api.AddBuilding(this.addBuilding).subscribe(
      success => {
        this.openDialog(false, "Successfully added the building!");
      },
      error => {
        this.openDialog(true, error);
      });
  }

  UpdateBuilding() {
    console.log(this.editBuilding);
    this.api.UpdateBuilding(this.editBuilding).subscribe(
      success => {
        this.openDialog(false, "Successfully updated the building!");
      },
      error => {
        this.openDialog(true, error);
      });
  }

  openDialog(status: boolean, message: string) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {error: status, message: message}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  add(event: MatChipInputEvent, add: boolean): void {
    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim() && add) {
      this.addBuilding.tags.push(value.trim());
    }
    else if ((value || '').trim() && !add) {
      this.editBuilding.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(tag: string, add: boolean): void {
    
    if(add) {
      let index_A = this.addBuilding.tags.indexOf(tag);
      if (index_A >= 0) {
        this.addBuilding.tags.splice(index_A, 1);
      }
    }
    else {
      let index_E = this.editBuilding.tags.indexOf(tag);
      if (index_E >= 0) {
        this.editBuilding.tags.splice(index_E, 1);
      }
    }
  }
}
