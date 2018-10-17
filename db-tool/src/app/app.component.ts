import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service'
import { Strings } from './services/strings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ApiService, Strings],
})

export class AppComponent implements OnInit {
  title = 'app';
  activeLink: string;

  constructor(private api: ApiService, public S: Strings, private router: Router) {
    // Set active tab to be the page that we are currently on.
    this.activeLink = window.location.pathname.split("/", 2)[1];
  }

  ngOnInit() {
    // Update the icon list from the database.
    this.api.GetIcons().subscribe(val => {
      this.S.Icons = val;
    });
  }

  SetActiveLink(link: string) {
    this.activeLink = link;
  }

  HandleRouteChange() {
    if(this.router.url === "/home") {
      this.S.RemoveLink("home");
      this.SetActiveLink("home");
      return;
    }

    let urlArray = this.router.url.split("/");
    let title = urlArray[urlArray.length-1];

    let link: string;
    let titleArray = title.split("-");
    if(titleArray.length == 1) {
      link = "/roomlist/" + title;
    }
    else if(titleArray.length == 2) {
      link = "/roomlist/" + titleArray[0];
      this.S.AddLink(link, titleArray[0]);
      link = "/roomdetail/" + title;
    }
    else if(titleArray.length == 3) {
      link = "/roomlist/" + titleArray[0];
      this.S.AddLink(link, titleArray[0]);
      link = "/roomdetail/" + titleArray[1];
      this.S.AddLink(link, titleArray[1])
      link = "/devicedetail/" + title;
    }
    this.S.AddLink(link, title);
    this.SetActiveLink(link);
  }
}
