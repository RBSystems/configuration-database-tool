import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormGroupDirective, FormControl, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ApiService } from '../api.service';
import { Strings } from '../strings.service';
import { AppComponent } from '../app.component';


export class DBError implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  app: AppComponent
  constructor(@Inject(forwardRef(() => AppComponent)) public _parent:AppComponent, private api: ApiService, public dialog: MatDialog, public S: Strings) { }

  ngOnInit() {
  }
}
