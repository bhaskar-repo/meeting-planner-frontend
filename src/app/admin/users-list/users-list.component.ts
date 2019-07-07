import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminMeetingService } from '../admin-meeting.service';
import { GlobalService } from 'src/app/global.service';
import { GlobalConfig } from 'src/app/globalConfig';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  allNormalUsers = [];

  constructor(private _router: Router, private _route: ActivatedRoute, private adminMeetingService: AdminMeetingService
    , private _global: GlobalService) { }

  ngOnInit() {
    this.getAllNormalUsers();
  }

  /**
   * @author Bhaskar Pawar
   * @description asks service to return all normal users
   */
  public getAllNormalUsers = () => {
    this.adminMeetingService.getAllNormalUsers().subscribe(
      (apiResponse) => {
        if (this._global.checkResStatus(apiResponse)) {
          this.allNormalUsers = apiResponse.data;
        }
      },
      (errorMessage) => {
        this._global.setErrorMessage(errorMessage);
        this._router.navigate([`/${GlobalConfig.apiVersion}/error`]);
      }
    )
  }//END getAllNormalUsers


  public navigateToUserscalendar = (user: any) => {
    this._router.navigate([`/${GlobalConfig.apiVersion}/users`, user.userId , 'dashboard']);
  }

}
