import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StringsService {

  constructor() { }

  public Links: string[] = [
    "home",
    "stuff"
  ]

  public Title(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }
}
