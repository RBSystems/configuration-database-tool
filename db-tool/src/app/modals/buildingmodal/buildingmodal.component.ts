import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { Building } from '../../objects';
import { Strings } from '../../services/strings.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-buildingmodal',
  templateUrl: './buildingmodal.component.html',
  styleUrls: ['./buildingmodal.component.scss']
})
export class BuildingModalComponent implements OnInit {
  buildingExists: boolean = true;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public dialogRef: MatDialogRef<BuildingModalComponent>, @Inject(MAT_DIALOG_DATA) public data: Building, public S: Strings, private api: ApiService) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

  ///// API FUNCTIONS /////
  SubmitBuilding() {
    if(!this.buildingExists) {
      this.api.AddBuilding(this.data).subscribe(
        success => {
          this.api.WriteTempChanges();
          this.buildingExists = true;
          this.dialogRef.close();
        },
        error => {
          this.dialogRef.close();
        });
    }
    else {
      this.api.UpdateBuilding(this.data._id, this.data).subscribe(
        success => {
          this.api.WriteTempChanges();
          this.dialogRef.close();
        },
        error => {
          this.dialogRef.close();
        });
    }
  }

  DeleteBuilding() {
    this.api.DeleteBuilding(this.data._id).subscribe(
      success => {
        this.api.WriteTempChanges();
        this.buildingExists = false;
        this.dialogRef.close();
      },
      error => {
        this.dialogRef.close();
      });
  }

  ///// TAGS /////
  AddChip(event: MatChipInputEvent): void {
    if(this.data.tags == null || this.data.tags.length == 0) {
      this.data.tags = [];
    }

    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim()) {
      this.data.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  RemoveChip(tag: string): void {
    let index_A = this.data.tags.indexOf(tag);
    if (index_A >= 0) {
      this.data.tags.splice(index_A, 1);
    }
  }
  /*-*/
}
