import { Component, OnInit } from '@angular/core';
import { GlobalConfig } from 'src/app/globalConfig';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminMeetingService } from '../admin-meeting.service';
import { GlobalService } from 'src/app/global.service';
import { MeetingSocketService } from '../meeting-socket.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  min = new Date();
  max: Date;
  userId: any;
  userName =  Cookie.get('userName');
  currentMeeeting: any;

  detailForm = new FormGroup({
    title: new FormControl('', Validators.required),
    start: new FormControl('', Validators.required),
    end: new FormControl('', Validators.required),
    purpose: new FormControl('', Validators.required),
    place: new FormControl('', Validators.required),
  })

  constructor(private _toastr: ToastrService, private _route: ActivatedRoute, private _router: Router,
    private _adminMeetingService: AdminMeetingService, private _global: GlobalService, 
    private _meetingSocketService: MeetingSocketService, private _location: Location) {
  }

  ngOnInit() {
    this.max = new Date(this.min.getFullYear(), 11, 31);
    this.userId = this._route.snapshot.paramMap.get('userId');
  }

  
  goBack():void {
    this._location.back();
  }

  validateEndDate = (): boolean => {
    return this.detailForm.value.end > this.detailForm.value.start;
  }

  /**
   * @author Bhaskar Pawar
   * @description will pass meeting details to service
   */
  public createMeeting = (): void => {
    if (this.validateEndDate()) {
      this._adminMeetingService.createNewMeeting(this.detailForm.value).subscribe(
        (apiResponse) => {
          if (this._global.checkResStatus(apiResponse)) {
            this._router.navigate([`/${GlobalConfig.apiVersion}/${this.userId}/admin/dashboard`]);
            this._meetingSocketService.emitAddMeeting(apiResponse.data);
            this._toastr.success(`${apiResponse.message}`, "Created !");
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
  }//END createNewMeeting

}
