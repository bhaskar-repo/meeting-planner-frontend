import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { UserAuthHttpService } from 'src/app/userauth/user-auth-http.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { GlobalConfig } from 'src/app/globalConfig';
import { MeetingSocketService } from 'src/app/admin/meeting-socket.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() userName = "default";

  notifyData: any;

  @ViewChild('notifyMe') notifyMe: TemplateRef<any>;
  modalRef: BsModalRef;

  constructor(private _userAuthHttpService: UserAuthHttpService, private _toastr: ToastrService, private _global: GlobalService
    , private _router: Router, private _meetingSocketService: MeetingSocketService, private _modalService: BsModalService) { }

  ngOnInit() {
    this.listenNotifyMeeting();
  }

  public listenNotifyMeeting = () => {
    this._meetingSocketService.listenNotifyMeeting().subscribe(
      (data) => {
        this.notifyData = data;
        this.notifyData.start = this._global.returnUTCDate(data.start.toString());
        this.notifyData.end = this._global.returnUTCDate(data.end.toString());
        this.modalRef = this._modalService.show(this.notifyMe, { class: 'modal-sm' });
      }
    )
  }

  public navigateToHome = () => {
    let userInfo = this._userAuthHttpService.getFromLocalStorage();
    if (userInfo.isAdmin) {
      this._router.navigate([`/${GlobalConfig.apiVersion}`, Cookie.get('userId'), 'admin', 'dashboard']);
    }
    else {
      this._router.navigate([`/${GlobalConfig.apiVersion}/users`, Cookie.get('userId'), 'dashboard']);
    }
  }
  /**
  * @author Bhaskar Pawar
  * logs out the user from system and delete the cookies and localstorage
  */
  public logOut = () => {
    let userId = Cookie.get('userId');
    this._userAuthHttpService.logOut(userId).subscribe((apiResponse) => {
      if (apiResponse.status === 200) {
        this._toastr.success(`${apiResponse.message}`, 'Logged Out !');
        Cookie.delete('userId');
        Cookie.delete('authToken');
        Cookie.delete('userName');
        localStorage.removeItem('userInfo');

        setTimeout(() => {
          this._router.navigate(['/api/v1/users/login']);
        }, 1000)
      }
      else {
        this._toastr.error(`${apiResponse.message}`, 'Error');
      }
    })
  }//end of log out

}
