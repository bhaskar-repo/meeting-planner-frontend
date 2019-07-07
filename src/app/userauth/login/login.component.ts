import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalConfig } from 'src/app/globalConfig';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { GlobalService } from 'src/app/global.service';
import { UserAuthHttpService } from '../user-auth-http.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  modalRef: BsModalRef;

  emailModal = new FormControl('', [Validators.required, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]),
    password: new FormControl('', [Validators.required]),
    isChecked: new FormControl('', Validators.required)
  });

  constructor(private _router: Router, private modalService: BsModalService, private _global: GlobalService,
    private _userauthHttpservice: UserAuthHttpService, private _toastr: ToastrService) { }

  ngOnInit() {
  }

  onSignupBtnClick() {
    this._router.navigate([`/${GlobalConfig.apiVersion}/users/signup`]);
  }

  onClickForgotPass() {
    this.modalRef = this.modalService.show(this.modalContent, { class: 'modal-lg' });
  }

  /**
   * @author Bhaskar Pawar
   * @description will logs in the user to the System
   */
  public logIn = () => {
    let logInData = {
      email: this.loginForm.get('email').value,
      password: this.loginForm.get('password').value
    }

    this._userauthHttpservice.logIn(logInData).subscribe(
      (apiResponse) => {
        if (this._global.checkResStatus(apiResponse)) {
          Cookie.set("authToken", apiResponse.data.authToken);
          Cookie.set("userId", apiResponse.data.userDetails.userId);
          Cookie.set("userName", apiResponse.data.userDetails.firstName + " " + apiResponse.data.userDetails.lastName);

          this._userauthHttpservice.setToLocalStorage(apiResponse.data.userDetails);
          
          if (apiResponse.data.userDetails.isAdmin) {
            this._router.navigate([`/${GlobalConfig.apiVersion}`, Cookie.get('userId') , 'admin', 'dashboard']);
          }
          else {
            this._router.navigate([`/${GlobalConfig.apiVersion}/users`, Cookie.get('userId') , 'dashboard']);
          }

          this._toastr.success(`${apiResponse.message}`, 'Success !');
          
        }
      },
      (errorMessage) => {
        this._global.setErrorMessage(errorMessage);
        this._router.navigate([`${GlobalConfig.apiVersion}/error`]);
      })

  }//end of log in

  /**
   * @description validates user email
   * @author Bhaskar Pawar
   */
  public validateUser = () => {
    this._userauthHttpservice.checkUserExist(this.emailModal.value).subscribe(
      (apiResponse) => {
        if (apiResponse.status === 201) {
          this._toastr.info(`${apiResponse.message}`, "Email !");
        }
        if (apiResponse.status === 200) {
          this.sendEmail();
        }
      },
      (errorMessage) => {
        this.modalRef.hide();
        this._global.setErrorMessage(errorMessage);
        this._router.navigate([`${GlobalConfig.apiVersion}/error`]);
      })

  }//end of validate user

  /**
   * @description will send request to send an email
   * @author Bhaskar Pawar
   */
  public sendEmail = () => {
    this._userauthHttpservice.sendEmail(this.emailModal.value).subscribe(
      (apiResponse) => {
        if (this._global.checkResStatus(apiResponse)) {
          this.modalRef.hide();
          this._router.navigate([`/${GlobalConfig.apiVersion}/users/resetlink`], { queryParams: { email: this.emailModal.value } });
          this.emailModal.setValue("");
        }
      },
      (errorMessage) => {
        this.modalRef.hide();
        this._global.setErrorMessage(errorMessage);
        this._router.navigate([`${GlobalConfig.apiVersion}/error`]);
      })
  }

}
