import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { GlobalConfig } from '../globalConfig';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SharedModule } from '../shared/shared.module';
import { ResetPasswordLinkComponent } from './reset-password-link/reset-password-link.component';

@NgModule({
  declarations: [LoginComponent, SignupComponent, ResetPasswordComponent, ResetPasswordLinkComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    RouterModule.forChild([
      { path: `${GlobalConfig.apiVersion}/users/signup`, component: SignupComponent },
      { path: `${GlobalConfig.apiVersion}/users/reset`, component: ResetPasswordComponent },
      { path: `${GlobalConfig.apiVersion}/users/resetlink`, component: ResetPasswordLinkComponent }
    ])
  ]
})
export class UserauthModule { }
