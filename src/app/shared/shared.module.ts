import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { HttpErrorComponent } from './http-error/http-error.component';
import { GlobalConfig } from '../globalConfig';
import { FirstCharComponent } from './first-char/first-char.component';
import { FirstCharDirective } from '../first-char.directive';

@NgModule({
  declarations: [HeaderComponent, HttpErrorComponent, FirstCharComponent, FirstCharDirective],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: `${GlobalConfig.apiVersion}/error`, component: HttpErrorComponent }
    ])
  ],
  exports: [HeaderComponent, HttpErrorComponent, FirstCharComponent]
})
export class SharedModule { }
