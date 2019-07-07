import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  parse,
  addMinutes
} from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private messageSource;
  currentMessage;

  constructor(private _toastr: ToastrService, private _router: Router) { }

  checkResStatus = (apiResponse: any): boolean => {
    let flag = true;
    if (apiResponse.status === 200) {
      flag = true;
    }
    else if (apiResponse.status === 201) {
      flag = false;
      this._toastr.info(`${apiResponse.message}`, "Info !");
    }
    else if (apiResponse.status === 202) {
      flag = false;
      this._toastr.error(`${apiResponse.message}`, "Error !");
    }
    else {
      flag = false;
    }
    return flag;
  }//end of check response status


  setErrorMessage = (errorMessage: string) => {
    this.messageSource = new BehaviorSubject(errorMessage);
    this.currentMessage = this.messageSource.asObservable();
  }

  returnUTCDate = (dateString: string): Date => {
    let date = new Date(dateString);
    return addMinutes(date, date.getTimezoneOffset());
  }

}
