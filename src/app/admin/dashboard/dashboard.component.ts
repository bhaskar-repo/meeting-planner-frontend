import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { timer } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { MeetingSocketService } from '../meeting-socket.service';
import { UserAuthHttpService } from 'src/app/userauth/user-auth-http.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
 
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  modalRef: BsModalRef;

  userName = Cookie.get('userName');
  value: any;
  delayForFiveSeconds: any;
  subscribe: any;

  constructor(private _modalservice: BsModalService, private _meetingSocketService: MeetingSocketService,
    private _userAuthHttpService: UserAuthHttpService) { }

  ngOnInit() {
    //this.modalRef = this._modalservice.show(this.modalContent, { class: 'modal-lg' });
    this.verifyUserConfirmation();
  }

  onClick() {
    this.modalRef.hide();
    this.delayForFiveSeconds = timer(5000);
    this.subscribe = this.delayForFiveSeconds.subscribe(() => {
      this.modalRef = this._modalservice.show(this.modalContent, { class: 'modal-lg' })
    });
  }

  onDismiss(){
    this.modalRef.hide();
    if (this.subscribe !== undefined) {
      this.subscribe.unsubscribe();
    }
    
  }

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

}
