import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { ModalModule } from 'ngx-bootstrap';
import { TimepickerModule } from 'ngx-bootstrap';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GlobalConfig } from '../globalConfig';
import { RouteGuardService as RouteGuard} from '../route-guard.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TimepickerModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    FlatpickrModule.forRoot(),
    ModalModule.forRoot(),
    RouterModule.forChild([
      { path: `${GlobalConfig.apiVersion}/users/:userId/dashboard`, component: DashboardComponent, canActivate: [RouteGuard]}
    ])
  ],
  exports: [DashboardComponent],
 
})
export class UserModule { }
