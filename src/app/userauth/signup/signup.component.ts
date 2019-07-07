import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { GlobalConfig } from 'src/app/globalConfig';
import { User } from '../user';
import { UserAuthHttpService } from '../user-auth-http.service';
import { GlobalService } from 'src/app/global.service';
import { UserValidationService } from '../user-validation.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {


  signupForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]),
    password: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', Validators.required),
    mobileNumber: new FormControl('', [Validators.required, Validators.min(1000000), Validators.max(9999999999)])
  });

  private countryName: String;
  private isChecked: Boolean;
  private countryNamesObj = [];
  private countryPhoneCodes: any;
  private countryPhoneCode: any = "91";

  constructor(private _router: Router, private _location: Location, private _toastr: ToastrService, private _userAuthHttpService: UserAuthHttpService,
    private _global: GlobalService, private _uservalidation: UserValidationService) { }

  ngOnInit() {
    this.getcountryNamesObj();
    this.getCountryPhoneCodes();
  }

  //called on click of back button will take you the previous page
  public goBack = () => {
    this._location.back();
  }

  /**
   * @author Bhaskar Pawar
   * @description on change of country get countryCode and countryName
   * @param {String} countryCode
   */
  public onCountryChange = () => {
    let countryCode = this.signupForm.get('countryCode').value;
    this.countryPhoneCode = this.countryPhoneCodes[countryCode];
    this.countryName = this.countryNamesObj.find(obj => obj.countryCode === countryCode).countryName;
  }//end of on country change

  /**
  * @author Bhaskar Pawar
  * @description this fetches the object from json for country names
  */
  public getcountryNamesObj = () => {
    this._userAuthHttpService.getCountryNamesObj().subscribe(data => {
      for (let obj of Object.entries(data)) {
        let newObj = {
          countryCode: obj[0],
          countryName: obj[1]
        }
        this.countryNamesObj.push(newObj);
      }
      this.countryNamesObj.sort((a: any, b: any) => {
        var nameA = a.countryName.toUpperCase(); // ignore upper and lowercase
        var nameB = b.countryName.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });

    },
      errorMessage => {
        this._global.setErrorMessage(errorMessage);
        setTimeout(() => {
          this._router.navigate([`/${GlobalConfig.apiVersion}/error`]);
        }, 500);
      })
  }//end of get country names

  /**
  * @author Bhaskar Pawar
  * @description this fetches the object from json for country phone codes
  */
  public getCountryPhoneCodes = () => {
    this._userAuthHttpService.getCountryPhonesobj().subscribe(data => {
      this.countryPhoneCodes = data;
    })
  }//end of get country phone codes

  /**
   * @author Bhaskar Pawar
   * @description This saves the user data on successful transcation and signs up
   */
  public signUp = () => {
    if (this._uservalidation.validatePassword(this.signupForm.get('password').value)) {
      this._toastr.info("Minimum 8 characters which contain only characters,numeric digits, underscore and first character must be a letter", "Password !");
    }
    else {
      let firstName = this.signupForm.get('firstName').value;
      let lastName = this.signupForm.get('lastName').value;
      let isAdmin = false;

      if (firstName.includes('admin') || lastName.includes('admin')) {
        isAdmin = true;
      }

      let user = new User(firstName,lastName ,
        this.signupForm.get('email').value, this.signupForm.get('password').value, this.countryName,
        this.signupForm.get('mobileNumber').value, this.signupForm.get('countryCode').value, this.countryPhoneCode,isAdmin);

      this._userAuthHttpService.signUp(user).subscribe(
        apiResponse => {
          if (this._global.checkResStatus(apiResponse)) {
            this._toastr.success("signed up successfully", "Success !");
            setTimeout(() => {
              this._router.navigate([`/${GlobalConfig.apiVersion}/users/login`]);
            }, 500);
          }
        },
        errorMessage => {
          this._global.setErrorMessage(errorMessage);
          setTimeout(() => {
            this._router.navigate([`/${GlobalConfig.apiVersion}/error`]);
          }, 500);
        }
      )
    }

  }// end of sign up function

}
