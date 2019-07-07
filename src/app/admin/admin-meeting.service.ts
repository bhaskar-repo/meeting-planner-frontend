import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs';
import { GlobalConfig } from '../globalConfig';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class AdminMeetingService {

  private baseUrl = `${GlobalConfig.serverUrl}/${GlobalConfig.apiVersion}/meetings`;
  private clientBaseUrl = `${GlobalConfig.clientUrl}/${GlobalConfig.apiVersion}/meetings`;
  userEmailsSubject: any;
  userEmails: any;

  constructor(private _http: HttpClient) { }

  /**
   * @author Bhaskar Pawar
   * @description will request server to fetch all normal users.
   */
  public getAllNormalUsers = (): Observable<any> => {
    return this._http.get(`${GlobalConfig.serverUrl}/${GlobalConfig.apiVersion}/users/all?authToken=${Cookie.get('authToken')}`).catch(this.handleError);
  }//END getAllNormalUsers

  /**
   * @author Bhaskar Pawar
   * @description will request to get all meetings from server
   * @param {string} userId
   * @returns {object} httpresponse
   */
  public getAllMeetings = (userId: string): Observable<any> => {
    return this._http.get(`${this.baseUrl}/${userId}/all?authToken=${Cookie.get('authToken')}`).catch(this.handleError);
  }//END getAllMeetings

  /**
   * @author Bhaskar Pawar
   * @description will request to get single meeting from server
   * @param {string} userId
   * @returns {object} httpresponse
   */
  public getMeeting = (userId: string, meetingId: string): Observable<any> => {
    return this._http.get(`${this.baseUrl}/${userId}/${meetingId}/get?authToken=${Cookie.get('authToken')}`).catch(this.handleError);
  }//END getAllMeetings

  /**
   * @author Bhaskar Pawar
   * @description will request server to create a new meeting
   * @param {any} meetingDetails
   */
  public createNewMeeting = (meetingDetails: any): Observable<any> => {

    let params = new HttpParams()
      .set('title', meetingDetails.title)
      .set('start', meetingDetails.start)
      .set('end', meetingDetails.end)
      .set('purpose', meetingDetails.purpose)
      .set('place', meetingDetails.place)
      .set('createdBy', Cookie.get('userName'))

    return this._http.post(`${this.baseUrl}/create?authToken=${Cookie.get('authToken')}`, params).catch(this.handleError);
  }//END createNewMeeting client http call

  /**
   * @author Bhaskar Pawar
   * @description will request server to edit a meeting
   * @param {any} userId
   * @param {any} meetingId
   * @param {any} meetingDetails
   */
  public editMeeting = (meetingId: any, meetingDetails: any): Observable<any> => {

    console.log(meetingDetails);

    let params = new HttpParams()
      .set('title', meetingDetails.title)
      .set('start', meetingDetails.start)
      .set('end', meetingDetails.end)
      .set('purpose', meetingDetails.purpose)
      .set('place', meetingDetails.place)

    return this._http.put(`${this.baseUrl}/${meetingId}/edit?authToken=${Cookie.get('authToken')}`, params).catch(this.handleError);
  }//END editMeeting client http call

  /**
   * @author Bhaskar Pawar
   * @description will request server to delete the meeting
   * @param {any} userId
   * @param {any} meetingId
   */
  public deleteMeeting = (meetingId: any): Observable<any> => {

    return this._http.post(`${this.baseUrl}/${meetingId}/delete?authToken=${Cookie.get('authToken')}`, meetingId).catch(this.handleError);
  }//END deleteMeeting client http call

  /**
   * @author Bhaskar Pawar
   * @description will request server to send email before meeting
   * @param {any} meetingDetails
   * @param {any} email
   */
  public sendEmailBeforeMeeting = (meetingDetails: any, email: any):Observable<any> => {

    let params = new HttpParams();

    Object.keys(meetingDetails).forEach((key) => {
      params = params.append(key, meetingDetails[key]);
    })

    return this._http.post(`${this.baseUrl}/before/${email}/sendmail?authToken=${Cookie.get('authToken')}`, params).catch(this.handleError);
  }//END sendEmailBeforeMeeting

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';

    if (err.error instanceof Error) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    } // end condition *if
    return Observable.throw(errorMessage);

  }  // END handleError

}
