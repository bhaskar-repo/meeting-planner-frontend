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
  isSameMonth,
  addHours,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  areRangesOverlapping
} from 'date-fns';
import { Subject } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarMonthViewDay,
  CalendarEventTitleFormatter,
  CalendarDateFormatter
} from 'angular-calendar';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalConfig } from 'src/app/globalConfig';
import { AdminMeetingService } from '../admin-meeting.service';
import { GlobalService } from 'src/app/global.service';
import { CustomEventTitleFormatter } from 'src/app/custom-event-title-formatter';
import { CustomDateFormatter } from 'src/app/custom-date-formatter-provider';
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
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css'],
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
export class CalendarViewComponent implements OnInit {

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  modalRef: BsModalRef;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  minDate: Date = new Date();
  maxDate: Date = new Date(this.minDate.getFullYear(), 11, 31);

  userId: string;

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  refresh: Subject<any> = new Subject();

  events: any[] = [];

  activeDayIsOpen: boolean = true;
  prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;

  constructor(private _modalservice: BsModalService, private _router: Router, private _route: ActivatedRoute,
    private _adminMeetingService: AdminMeetingService, private _global: GlobalService, private _location: Location) { }

  ngOnInit() {
    this.userId = this._route.snapshot.paramMap.get('userId');
    this.getAllMeetings();
    this.dateOrViewChanged();
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

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarView): void {
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

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
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
    //this.handleEvent('Dropped or resized', meetingId, event);
  }

  handleEvent(action: string, eventDetails: any, event: CalendarEvent): void {

    this.modalData = { event, action };
    //this.modalRef = this._modalservice.show(this.modalContent, { class: 'modal-lg' });
    this._router.navigate([`/${GlobalConfig.apiVersion}/${this.userId}/admin/meetings/${eventDetails.meetingId}/edit`]);
  }

  /**
   * @author Bhaskar Pawar
   * @description to fetch all meetings and display on calendar
   */
  public getAllMeetings = (): void => {
    this._adminMeetingService.getAllMeetings(this.userId).subscribe(
      (apiResponse) => {
        if (this._global.checkResStatus(apiResponse)) {
          let meetings = apiResponse.data;
          if (meetings.length > 1) {
            meetings = this.isOverLappingMeetings(meetings);
          }
         
          meetings.forEach((meeting) => {
            let event = {
              meetingId: meeting.meetingId,
              title: meeting.title,
              start: this._global.returnUTCDate(meeting.start.toString()),
              end: this._global.returnUTCDate(meeting.end.toString()),
              purpose: meeting.purpose,
              place: meeting.place,
              color: meeting.color
            }

            this.events.push(event);
            this.refresh.next();
          })
        }
      },
      (errorMessage) => {
        this._global.setErrorMessage(errorMessage);
        this._router.navigate([`/${GlobalConfig.apiVersion}/error`]);
      }
    )
  }//END getAllMeetings


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


  /**
   * @author Bhaskar Pawar
   * @description This will navigate to details view
   * @returns {void}
   */
  navigateToDetailView(): void {
    let userId = this._route.snapshot.paramMap.get('userId');
    this._router.navigate([`/${GlobalConfig.apiVersion}`, userId, 'admin', 'meetings', 'create']);
  }//END navigateToDetailView

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach(day => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

}
