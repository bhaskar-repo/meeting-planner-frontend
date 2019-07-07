import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminMeetingService } from '../admin-meeting.service';
import { GlobalService } from 'src/app/global.service';
import { GlobalConfig } from 'src/app/globalConfig';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { MeetingSocketService } from '../meeting-socket.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Location } from '@angular/common';

@Component({
  selector: 'app-details-view',
  templateUrl: './details-view.component.html',
  styleUrls: ['./details-view.component.css']
})
export class DetailsViewComponent implements OnInit {

  min = new Date();
  max: Date;
  userId: any;
  userName = Cookie.get('userName');
  meetingId: any;
  createdBy: any;

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  modalRef: BsModalRef;

  detailForm = new FormGroup({
    title: new FormControl('', Validators.required),
    start: new FormControl('', Validators.required),
    end: new FormControl('', Validators.required),
    purpose: new FormControl('', Validators.required),
    place: new FormControl('', Validators.required),
  })
  constructor(private _toastr: ToastrService, private _route: ActivatedRoute, private _router: Router,
    private _adminMeetingService: AdminMeetingService, private _global: GlobalService, private _modalService: BsModalService, 
    private _meetingSocketService: MeetingSocketService, private _location: Location) {
  }

  ngOnInit() {
    this.max = new Date(this.min.getFullYear(), 11, 31);
    this.userId = this._route.snapshot.paramMap.get('userId');
    this.meetingId = this._route.snapshot.paramMap.get('meetingId');
    this.getMeetingDetails();

  }

  
  goBack():void {
    this._location.back();
  }

  validateEndDate = (): boolean => {
    return this.detailForm.value.end > this.detailForm.value.start;
  }

  onClickDeleteBtn = () => {
    this.modalRef = this._modalService.show(this.modalContent, { class: 'modal-lg' });
  }

  /**
   * @author Bhaskar Pawar
   * @description This will fetch single meeting
   */
  public getMeetingDetails = (): void => {
    this._adminMeetingService.getMeeting(this.userId, this.meetingId).subscribe(
      (apiResponse) => {
        if (this._global.checkResStatus(apiResponse)) {
          this.createdBy = apiResponse.data.createdBy;
          this.detailForm.get('title').setValue(apiResponse.data.title);
          this.detailForm.get('start').setValue(this._global.returnUTCDate(apiResponse.data.start));
          this.detailForm.get('end').setValue(this._global.returnUTCDate(apiResponse.data.end));
          this.detailForm.get('purpose').setValue(apiResponse.data.purpose);
          this.detailForm.get('place').setValue(apiResponse.data.purpose);
        }
      }
    )
  }

  /**
   * @author Bhaskar Pawar
   * @description This is to edit the selected meeting
   */
  public editMeeting = (): void => {

    if (this.validateEndDate()) {
      this._adminMeetingService.editMeeting(this.meetingId, this.detailForm.value).subscribe(
        (apiResponse) => {
          if (this._global.checkResStatus(apiResponse)) {
            this._router.navigate([`/${GlobalConfig.apiVersion}/${this.userId}/admin/dashboard`]);
            this._meetingSocketService.emitEditMeeting(apiResponse.data);
            this._toastr.success(`${apiResponse.message}`, "Edited !");
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
  }//END editMeeting

  /**
   * @author Bhaskar Pawar
   * @description requests server to delete the meeting
   */
  public deleteMeeting = () => {
    this._adminMeetingService.deleteMeeting(this.meetingId).subscribe(
      (apiResponse) => {
        if (this._global.checkResStatus(apiResponse)) {
          this._router.navigate([`/${GlobalConfig.apiVersion}/${this.userId}/admin/dashboard`]);
          this._toastr.success(`${apiResponse.message}`, "Deleted !");
        }
      },
      (errorMessage) => {
        this._global.setErrorMessage(errorMessage);
        this._router.navigate([`/${GlobalConfig.apiVersion}/error`]);
      }
    )
    this.modalRef.hide();
  }//END deleteMeeting

}
