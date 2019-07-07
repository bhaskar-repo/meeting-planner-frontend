import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminMeetingService } from 'src/app/admin/admin-meeting.service';
import { GlobalService } from 'src/app/global.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-meeting',
  templateUrl: './view-meeting.component.html',
  styleUrls: ['./view-meeting.component.css']
})
export class ViewMeetingComponent implements OnInit {

  userId: any;
  userName = Cookie.get('userName');
  meetingId: any;
  currentMeeting:any;

  constructor(private _route: ActivatedRoute, private _adminMeetingService: AdminMeetingService, private _global: GlobalService,
    private _location:Location) { }

  ngOnInit() {
    this.userId = this._route.snapshot.paramMap.get('userId');
    this.meetingId = this._route.snapshot.paramMap.get('meetingId');
    this.getMeetingDetails();
  }

  goBack():void {
    this._location.back();
  }

  /**
   * @author Bhaskar Pawar
   * @description This will fetch single meeting
   */
  public getMeetingDetails = (): void => {
    this._adminMeetingService.getMeeting(this.userId, this.meetingId).subscribe(
      (apiResponse) => {
        if (this._global.checkResStatus(apiResponse)) {
          this.currentMeeting = apiResponse.data;
          this.currentMeeting.start = this._global.returnUTCDate(this.currentMeeting.start);
          this.currentMeeting.end = this._global.returnUTCDate(this.currentMeeting.end);
        }
      }
    )
  }//END getMeetingDetails


}
