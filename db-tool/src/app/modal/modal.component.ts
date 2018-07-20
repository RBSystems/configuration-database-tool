import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

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

export enum MessageType {Success, Error, Info, Mixed}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  messageType = MessageType;
  constructor(public dialogRef: MatDialogRef<ModalComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

  onNoClick() {
    this.dialogRef.close();
  }

  closeX() {
    this.dialogRef.close();
  }
}
