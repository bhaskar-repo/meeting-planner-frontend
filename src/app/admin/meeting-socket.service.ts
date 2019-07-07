import { Injectable } from '@angular/core';
import { GlobalConfig } from '../globalConfig';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeetingSocketService {

  private url = `${GlobalConfig.serverUrl}`;
  private socket;

  constructor() {
    this.socket = io(this.url);
  }


  // events to be listened 

  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verify-user', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable

  } // end verifyUser

  public listenMeetingAdded = () => {
    return Observable.create((observer) => {
      this.socket.on('meeting-added', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable

  } // END listenMeetingAdded

  public listenMeetingEdited = () => {
    return Observable.create((observer) => {
      this.socket.on('meeting-edited', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable

  } // END listenMeetingEdited

  public listenMeetingDeleted = () => {
    return Observable.create((observer) => {
      this.socket.on('meeting-deleted', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable

  } // END listenMeetingDeleted

  public listenNotifyMeeting = () => {
    return Observable.create((observer) => {
      this.socket.on('notify-meeting', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  }//END listenNotifyMeeting

  public listenNotifyBeforeMeeting = () => {
    return Observable.create((observer) => {
      this.socket.on('notify-before-meeting', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  }//END listenNotifyMeeting

  // events to be emitted

  public setUser = (authToken: any) => {
    this.socket.emit("set-user", authToken);
  } // end setUser

  public emitAddMeeting = (data) => {
    this.socket.emit('add-meeting', data);
  }//END emitAddMeeting

  public emitEditMeeting = (data) => {
    this.socket.emit('edit-meeting', data);
  }//END emitEditMeeting

  public emitDeleteMeeting = (data) => {
    this.socket.emit('delete-meeting', data);
  }//END emitDeleteMeeting

  public emitNotifyBeforeMeeting = (data) => {
    this.socket.emit('notify-before-meeting', data);
  }//END emitNotifyBeforeMeeting
}
