import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Strings } from '../strings.service';

export interface DialogData {
  type: MessageType;
  subheader: string;
  message?: string;
  results?: Result[];
}

export interface Result {
  message: string;
  success: boolean;
  error?: string;
}

export enum MessageType {Success, Error, Info, Mixed, Icons}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  messageType = MessageType;
  constructor(public dialogRef: MatDialogRef<ModalComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, public S: Strings) { }

  ngOnInit() {
  }

  onNoClick() {
    this.dialogRef.close();
  }

  closeX() {
    this.dialogRef.close();
  }
  
  IconReturn(icon: string) {
    this.dialogRef.close(icon);
  }
}
