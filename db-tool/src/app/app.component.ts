import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service'
import { Strings } from './strings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ApiService, Strings],
})

export class AppComponent implements OnInit {
  title = 'app';
  activeLink: string;

  constructor(private api: ApiService, public S: Strings) {
    // Set active tab to be the page that we are currently on.
    this.activeLink = window.location.pathname.split("/", 2)[1];
  }

  ngOnInit() {
    // Update the icon list from the database.
    this.UpdateIcons()
  }

  SetActiveLink(link: string) {
    this.activeLink = link;
  }

  UpdateIcons() {
    this.api.GetIcons().subscribe(val => {
      this.S.Icons = val;
    });
  }
}
