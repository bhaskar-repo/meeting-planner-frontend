import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isToday,
  isSameMonth,
  addHours,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  differenceInMinutes,
  areRangesOverlapping
} from 'date-fns';
import { Subject, Observable } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarEventTitleFormatter,
  CalendarMonthViewDay,
  CalendarDateFormatter
} from 'angular-calendar';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserAuthHttpService } from 'src/app/userauth/user-auth-http.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { MeetingSocketService } from 'src/app/admin/meeting-socket.service';
import { GlobalService } from 'src/app/global.service';
import { AdminMeetingService } from 'src/app/admin/admin-meeting.service';
import { GlobalConfig } from 'src/app/globalConfig';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomEventTitleFormatter } from 'src/app/custom-event-title-formatter';
import { CustomDateFormatter } from 'src/app/custom-date-formatter-provider';
import { interval } from 'rxjs';
import { Location } from '@angular/common';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

type CalendarPeriod = 'day' | 'week' | 'month';

function addPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: addDays,
    week: addWeeks,
    month: addMonths
  }[period](date, amount);
}

function subPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: subDays,
    week: subWeeks,
    month: subMonths
  }[period](date, amount);
}

function startOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: startOfDay,
    week: startOfWeek,
    month: startOfMonth
  }[period](date);
}

function endOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: endOfDay,
    week: endOfWeek,
    month: endOfMonth
  }[period](date);
}

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    },
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ]

})
export class DashboardComponent implements OnInit {

  @ViewChild('modalAddMeeting') modalAddMeeting: TemplateRef<any>;
  @ViewChild('modalEditMeeting') modalEditMeeting: TemplateRef<any>;
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('notifyMe') notifyMe: TemplateRef<any>;
  modalRef: BsModalRef;
  timer: any = interval(60000);
  snoozeInterval: any;
  selectedMeetingModal: any;

  userName = Cookie.get('userName');
  userInfo: any;
  view: CalendarPeriod = 'month';

  CalendarView = CalendarView;

  minDate = new Date();
  maxDate = new Date(this.minDate.getFullYear(), 11, 31);

  prevBtnDisabled: boolean = false;

  nextBtnDisabled: boolean = false;

  viewDate: Date = new Date();
  selectedMeeting: any;
  isAdmin: Boolean;

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  detailForm = new FormGroup({
    title: new FormControl('', Validators.required),
    start: new FormControl(new Date(), Validators.required),
    end: new FormControl(new Date(), Validators.required),
    purpose: new FormControl('', Validators.required),
    place: new FormControl('', Validators.required),
  })

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil-alt"></i>',
      onClick: ({ event }: { event: any }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: any }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  private events: any[] = [];

  activeDayIsOpen: boolean = true;


  constructor(private _modalService: BsModalService, private _userAuthHttpService: UserAuthHttpService,
    private _meetingSocketService: MeetingSocketService, private _global: GlobalService, private adminMeetingService: AdminMeetingService,
    private _router: Router, private _route: ActivatedRoute, private _toastr: ToastrService, private _location: Location) {
    this.dateOrViewChanged();
  }

  ngOnInit() {
    this.userInfo = this._userAuthHttpService.getFromLocalStorage();
    this.isAdmin = this.userInfo.isAdmin;
    this.getAllMeetings();
    this.verifyUserConfirmation();
    this.listenMeetingAdded();
    this.listenMeetingEdited();
    this.listenMeetingDeleted();
    this.listenNotifyBeforeMeeting();
  }

  goBack():void {
    this._location.back();
  }

  increment(): void {
    this.changeDate(addPeriod(this.view, this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(subPeriod(this.view, this.viewDate, 1));
  }

  today(): void {
    this.changeDate(new Date());
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarPeriod): void {
    this.view = view;
    this.dateOrViewChanged();
  }

  dateOrViewChanged(): void {
    this.prevBtnDisabled = !this.dateIsValid(
      endOfPeriod(this.view, subPeriod(this.view, this.viewDate, 1))
    );
    this.nextBtnDisabled = !this.dateIsValid(
      startOfPeriod(this.view, addPeriod(this.view, this.viewDate, 1))
    );
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach(day => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = true;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: any): void {
    this.modalData = { event, action };
    if ('Edited' === action) {
      this.selectedMeeting = event;
      this.detailForm.get('title').setValue(this.selectedMeeting.title);
      this.detailForm.get('start').setValue(this.selectedMeeting.start);
      this.detailForm.get('end').setValue(this.selectedMeeting.end);
      this.detailForm.get('purpose').setValue(this.selectedMeeting.purpose);
      this.detailForm.get('place').setValue(this.selectedMeeting.place);
      this.modalRef = this._modalService.show(this.modalEditMeeting, { class: 'modal-lg' });
    }
    else if ('Deleted' === action) {
      this.adminMeetingService.deleteMeeting(event.meetingId).subscribe(
        (apiResponse) => {
          if (this._global.checkResStatus(apiResponse)) {
            this._meetingSocketService.emitDeleteMeeting('delete meeting');
            this._toastr.success(`${apiResponse.message}`, "Deleted !");
          }
        },
        (errorMessage) => {
          this._global.setErrorMessage(errorMessage);
          this._router.navigate([`/${GlobalConfig.apiVersion}/error`]);
        })
    }
    else if ('Clicked' === action) {
      let userId = this._route.snapshot.paramMap.get('userId');
      this._router.navigate([`/${GlobalConfig.apiVersion}/${userId}/meetings/${event.meetingId}/view`]);
    }

  }

  public listenMeetingAdded = () => {
    this._meetingSocketService.listenMeetingAdded().subscribe(
      (data) => {
       this.getAllMeetings();
      }
    )
  }//END listenMeetingAdded


  public listenMeetingEdited = () => {
    this._meetingSocketService.listenMeetingEdited().subscribe(
      (data) => {
       
       this.getAllMeetings();
      }
    )
  }//END listenMeetingEdited

  public listenMeetingDeleted = () => {
    this._meetingSocketService.listenMeetingDeleted().subscribe(
      (data) => {
       
       this.getAllMeetings();
      }
    )
  }//END listenMeetingEdited

  public verifyUserConfirmation = (): any => {
    this._meetingSocketService.verifyUser()
      .subscribe((data) => {
        let userDetails = {
          authToken: Cookie.get('authToken'),
          userInfo: this._userAuthHttpService.getFromLocalStorage()
        }
        this._meetingSocketService.setUser(userDetails);

      });
  }//end of verify user confirmation

  /**
   * will open add new meeting dialog
   */
  public addNewMeeting(): void {
    this.setDefaults();
    this.modalRef = this._modalService.show(this.modalAddMeeting, { class: 'modal-lg' });
  }

  public setDefaults = () => {
    this.detailForm.get('start').setValue(new Date());
    this.detailForm.get('end').setValue(new Date());
    this.detailForm.get('title').setValue('');
    this.detailForm.get('purpose').setValue('');
    this.detailForm.get('place').setValue('');
  }


  /**
   * @author Bhaskar Pawar
   * @description to fetch all meetings and display on calendar
   */
  public getAllMeetings = (): void => {
    this.events = [];
    let userId = this._route.snapshot.paramMap.get('userId');
    this.adminMeetingService.getAllMeetings(userId).subscribe(
      (apiResponse) => {
        if (this._global.checkResStatus(apiResponse)) {

          let meetings = apiResponse.data//.filter(meeting => new Date(meeting.start.toString()).getDay() >= new Date().getDay());
          meetings = this.isOverLappingMeetings(meetings);
          let count = 0;
          meetings.forEach(meeting => {
            let event = {
              meetingId: meeting.meetingId,
              title: meeting.title,
              start: this._global.returnUTCDate(meeting.start.toString()),
              end: this._global.returnUTCDate(meeting.end.toString()),
              purpose: meeting.purpose,
              place: meeting.place,
              color: meeting.color,
              actions: this.isAdmin ? this.actions : ''
            }
            if (isToday(event.start)) {
              count = count + 1;
            }

            this.events.push(event);
          })
          this.refresh.next();
          setTimeout(() => {
            if (!this.isAdmin) {
              this.notifyUserBeforeMeeting(count);
            }
          }, 1000)
        }
      },
      (errorMessage) => {
        this._global.setErrorMessage(errorMessage);
        this._router.navigate([`/${GlobalConfig.apiVersion}/error`]);
      }
    )
  }//END getAllMeetings


  /**
   * @author Bhaskar Pawar
   * @description will pass data to add new meeting
   */
  public confirmAddMeeting() {
    let startDate = new Date(this.detailForm.value.start);
    let start = new Date(this.returnDateWithTime(startDate));
    let endDate = new Date(this.detailForm.value.end);
    let end = new Date(this.returnDateWithTime(endDate));
    this.detailForm.get('start').setValue(start);
    this.detailForm.get('end').setValue(end);

    if (this.validateEndDate()) {
      this.adminMeetingService.createNewMeeting(this.detailForm.value).subscribe(
        (apiResponse) => {
          if (this._global.checkResStatus(apiResponse)) {
            this._meetingSocketService.emitAddMeeting(apiResponse.data);
            this.modalRef.hide();
            this._toastr.success(`${apiResponse.message}`, 'Created !');

          }
        },
        (errorMessage) => {
          this._global.setErrorMessage(errorMessage);
          this._router.navigate([`/${GlobalConfig.apiVersion}/error`]);
        }
      )
    }
    else {
      this._toastr.error('End time should be greater than start time', "End Time !");
    }


  }//END confirmAddMeeting

  /**
  * @author Bhaskar Pawar
  * @description will pass data to edit new meeting
  */
  public confirmEditMeeting() {
    let userId = this._route.snapshot.paramMap.get('userId');
    
    if (this.validateEndDate()) {
      this.adminMeetingService.editMeeting(this.selectedMeeting.meetingId, this.detailForm.value).subscribe(
        (apiResponse) => {
          if (this._global.checkResStatus(apiResponse)) {

            this.modalRef.hide();
            this._router.navigate([`/${GlobalConfig.apiVersion}/users`, userId, 'dashboard']);
            this._meetingSocketService.emitEditMeeting(this.detailForm.value);
            this._toastr.success(`${apiResponse.message}`, 'Edited !');
          }
        },
        (errorMessage) => {
          this._global.setErrorMessage(errorMessage);
          this._router.navigate([`/${GlobalConfig.apiVersion}/error`]);
        }
      )
    }
    else {
      this._toastr.error('End time should be greater than start time', "End Time !");
    }

  }//END confirmEditMeeting

  public returnDateWithTime = (date: Date) => {
    this.viewDate.setHours(date.getHours());
    this.viewDate.setMinutes(date.getMinutes());
    this.viewDate.setSeconds(date.getSeconds());
    return this.viewDate;
  }

  public isOverLappingMeetings = (meetings: any):any => {

   for(let iEvent of meetings) {
    for (let jEvent of meetings) {
      let flag = areRangesOverlapping(this._global.returnUTCDate(iEvent.start),this._global.returnUTCDate(iEvent.end),
      this._global.returnUTCDate(jEvent.start),this._global.returnUTCDate(jEvent.end));
      if (flag) {
        iEvent.color = colors.red;
      }
      else {
        iEvent.color = colors.blue;
      }
    } 
   }
   return meetings;
  }

  validateEndDate = () => {
    return this.detailForm.value.end > this.detailForm.value.start;
  }

  deleteMeeting(eventToDelete: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  public listenNotifyBeforeMeeting = () => {
    this._meetingSocketService.listenNotifyBeforeMeeting().subscribe(
      (meeting) => {
        this.selectedMeetingModal = meeting;
        this.modalRef = this._modalService.show(this.notifyMe, { class: 'modal-sm' });
      }
    )
  }

  //This will notify user one minute before meeting 
  public notifyUserBeforeMeeting = (todayMeetingsCount: number) => {
    let count = 0;
    let subscribeMe = this.timer.subscribe(() => {
      this.events.forEach(event => {
        if (isToday(event.start)) {
          let timeDiff = differenceInMinutes(event.start, new Date());
          if (timeDiff === 1) {
            this._meetingSocketService.emitNotifyBeforeMeeting(event);
            this.adminMeetingService.sendEmailBeforeMeeting(event, this.userInfo.email).subscribe(
              (apiResponse) => {
                console.log('sentmail');
              }
            )
          }
         
          if (timeDiff <= 0) {
            count = count + 1;
            if (count === todayMeetingsCount) {
              subscribeMe.unsubscribe();
            }
          }
        }
      })
    })

  }

  public snoozeMeeting = (meeting: any) => {
    let timer = interval(5000);
    this.selectedMeetingModal = meeting;
    this.modalRef.hide();
    this.snoozeInterval = timer.subscribe(() => {
      this.modalRef = this._modalService.show(this.notifyMe, { class: 'modal-sm' });
    })
    
  }

  public dismissMeeting = () => {
    if (this.snoozeInterval !== undefined) {
      this.snoozeInterval.unsubscribe();
    }
    
    this.modalRef.hide();
  }


}
