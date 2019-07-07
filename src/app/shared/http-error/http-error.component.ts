import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-http-error',
  templateUrl: './http-error.component.html',
  styleUrls: ['./http-error.component.css']
})
export class HttpErrorComponent implements OnInit {

  errorMessage: string;

  constructor(private _location: Location, private _global: GlobalService) { }

  ngOnInit() {
    this._global.currentMessage.subscribe(errorMessage => this.errorMessage = errorMessage);
  }

  goBack() {
    this._location.back();
  }
}
