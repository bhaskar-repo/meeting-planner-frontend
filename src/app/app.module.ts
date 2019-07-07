import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { UserauthModule } from './userauth/userauth.module';
import { SharedModule } from './shared/shared.module';
import { AdminModule } from './admin/admin.module';
import { GlobalConfig } from './globalConfig';
import { LoginComponent } from './userauth/login/login.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      closeButton: true
    }),
    UserModule,
    UserauthModule,
    AdminModule,
    SharedModule,
    RouterModule.forRoot([
      { path: `${GlobalConfig.apiVersion}/users/login`, component: LoginComponent, pathMatch: 'full' },
      { path: '', redirectTo: `${GlobalConfig.apiVersion}/users/login`, pathMatch: 'full' },
      { path: '*', component: LoginComponent, pathMatch: 'full' },
      { path: '**', component: LoginComponent, pathMatch: 'full' }
    ]),
   
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
