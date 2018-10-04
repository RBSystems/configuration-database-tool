import { Component, OnInit, Input } from '@angular/core';
import { Building } from '../objects'
import { ApiService } from '../services/api.service';
import { MatDialog, MatAccordionDisplayMode } from '@angular/material';
import { ModalComponent, MessageType, Result } from '../modal/modal.component';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DBError } from '../home/home.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';
import { Strings } from '../services/strings.service';

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent implements OnInit {
  @Input() building: Building;
  @Input() buildingExists: boolean = false;
  @Input() IDToUpdate: string;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private api: ApiService, public dialog: MatDialog, private _formBuilder: FormBuilder, public S: Strings) { }

  ngOnInit() {
    this.building = new Building();
  }

  ngOnChanges() {
    if(this.building != null) {
      this.IDToUpdate = this.building._id;
    }
  }

  ///// API FUNCTIONS /////
  SubmitBuilding() {
    let res: Result[] = [];
    if(!this.buildingExists) {
      this.api.AddBuilding(this.building).subscribe(
        success => {
          res.push({message: this.building._id + " was successfully added.", success: true});
          this.openDialog(MessageType.Success, "Building Added", null, res);
          this.api.WriteTempChanges();
          this.buildingExists = true;
        },
        error => {
          let errorMsg = this.S.ErrorCodeMessages[error.status];
          res.push({message: error.json(), success: false, error: error});
          this.openDialog(MessageType.Error, errorMsg, null, res);
        });
    }
    else {
      this.api.UpdateBuilding(this.IDToUpdate, this.building).subscribe(
        success => {
          res.push({message: this.building._id + " was successfully updated.", success: true});
          this.openDialog(MessageType.Success, "Building Updated", null, res);
          this.IDToUpdate = this.building._id;
          this.api.WriteTempChanges();
        },
        error => {
          let errorMsg = this.S.ErrorCodeMessages[error.status];
          res.push({message: error.json(), success: false, error: error});
          this.openDialog(MessageType.Error, errorMsg, null, res);
        });
    }
  }

  DeleteBuilding() {
    let res: Result[] = [];
  
    this.api.DeleteBuilding(this.building._id).subscribe(
      success => {
        res.push({message: this.building._id + " was successfully deleted.", success: true});
        this.openDialog(MessageType.Success, "Building Deleted", null, res);
        this.api.WriteTempChanges();
        this.buildingExists = false;
      },
      error => {
        let errorMsg = this.S.ErrorCodeMessages[error.status];
        res.push({message: error.json(), success: false, error: error});
        this.openDialog(MessageType.Error, errorMsg, null, res);
      });
  }

  ///// RESPONSE MESSAGE /////
  openDialog(status: MessageType, subheader: string, message?: string, results?: Result[]) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {type: status, subheader: subheader, message: message, results: results}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  /*-*/

  ///// TAGS /////
  AddChip(event: MatChipInputEvent): void {
    if(this.building.tags == null || this.building.tags.length == 0) {
      this.building.tags = [];
    }

    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim()) {
      this.building.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  RemoveChip(tag: string): void {
    let index_A = this.building.tags.indexOf(tag);
    if (index_A >= 0) {
      this.building.tags.splice(index_A, 1);
    }
  }
  /*-*/
}
