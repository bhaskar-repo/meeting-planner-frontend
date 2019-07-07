import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalConfig } from 'src/app/globalConfig';
import { ToastrService } from 'ngx-toastr';
import { UserValidationService } from '../user-validation.service';
import { UserAuthHttpService } from '../user-auth-http.service';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetPassForm = new FormGroup({
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required)
  })

  constructor(private _route: ActivatedRoute, private _toastr: ToastrService, 
     private _router: Router,
     private _uservalidation: UserValidationService, private _global: GlobalService,
     private userauthHttpservice: UserAuthHttpService) { }

  ngOnInit() {
  }

   /**
   * @description request the server to set new password
   * @author Bhaskar Pawar
   */
  public resetPassword = () => {
    let localPassword = this.resetPassForm.get('password').value;
    let localConfirmPass = this.resetPassForm.get('confirmPassword').value;
    let email = this._route.snapshot.queryParamMap.get('email');
    let data = {
      email: email,
      password: localPassword,
    }
    if (localPassword !== localConfirmPass) {
      this._toastr.info("Passwords not matching", 'Password !');
    }
    else if (this._uservalidation.validatePassword(localPassword)) {
      this._toastr.info("Minimum 8 characters which contain only characters,numeric digits, underscore and first character must be a letter", "Password !");
    }
    else {
      this.userauthHttpservice.resetPassword(data).subscribe((apiResponse) => {
        if (this._global.checkResStatus(apiResponse)) {
          this._toastr.success(apiResponse.message, "Success !");
          setTimeout(() => {
            this._router.navigate([`/${GlobalConfig.apiVersion}/users/login`]);
          }, 1000)
        }
      },
      (errorMessage) => {
        
      })
    }
  }//end of reset password

}
