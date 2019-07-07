import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { ModalModule, TabsModule } from 'ngx-bootstrap';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { GlobalConfig } from '../globalConfig';
import { RouteGuardService as RouteGuard } from '../route-guard.service';
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { DetailsViewComponent } from './details-view/details-view.component';
import { UsersListComponent } from './users-list/users-list.component';
import { HttpClientModule } from '@angular/common/http';
import { CreateComponent } from './create/create.component';
import { SharedModule } from '../shared/shared.module';
import { ViewMeetingComponent } from './view-meeting/view-meeting.component';


export const MY_MOMENT_FORMATS = {
  parseInput: 'l LTS',
  fullPickerInput: 'l LTS',
  datePickerInput: 'l',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  declarations: [DashboardComponent, CalendarViewComponent, DetailsViewComponent, UsersListComponent, CreateComponent, ViewMeetingComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    TabsModule.forRoot(),
    FlatpickrModule.forRoot(),
    OwlDateTimeModule,
    OwlMomentDateTimeModule,
    ModalModule.forRoot(),
    RouterModule.forChild([
      { path: `${GlobalConfig.apiVersion}/:userId/admin/dashboard`, component: DashboardComponent, canActivate: [RouteGuard] },
      { path: `${GlobalConfig.apiVersion}/:userId/admin/calendarview`, component: CalendarViewComponent, canActivate: [RouteGuard] },
      { path: `${GlobalConfig.apiVersion}/:userId/admin/meetings/create`, component: CreateComponent, canActivate: [RouteGuard] },
      { path: `${GlobalConfig.apiVersion}/:userId/admin/meetings/:meetingId/edit`, component: DetailsViewComponent, canActivate: [RouteGuard] },
      { path: `${GlobalConfig.apiVersion}/:userId/meetings/:meetingId/view`, component: ViewMeetingComponent, canActivate: [RouteGuard] }
    ]
    )
  ],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_FORMATS },
  ]
})
export class AdminModule { }
