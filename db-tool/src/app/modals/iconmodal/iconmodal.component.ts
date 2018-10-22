import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from '../../services/api.service';
import { Strings } from '../../services/strings.service';

@Component({
  selector: 'app-iconmodal',
  templateUrl: './iconmodal.component.html',
  styleUrls: ['./iconmodal.component.scss']
})
export class IconModalComponent implements OnInit {
  iconList: string[] = [];

  constructor(public dialogRef: MatDialogRef<IconModalComponent>, @Inject(MAT_DIALOG_DATA) public data: string, public S: Strings, private api: ApiService) { }

  ngOnInit() {
    this.GetIcons();
  }

  Close(newIcon?: string) {
    if(newIcon != null) {
      this.dialogRef.close(newIcon);
    }
    else {
      this.dialogRef.close();
    }
  }

  ///// API FUNCTIONS /////
  GetIcons() {
    this.api.GetIcons().subscribe(val => {
      if(val != null) {
        this.iconList = val;
      }
    });
  }
}
