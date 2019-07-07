import { TestBed } from '@angular/core/testing';

import { MeetingSocketService } from './meeting-socket.service';

describe('MeetingSocketService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MeetingSocketService = TestBed.get(MeetingSocketService);
    expect(service).toBeTruthy();
  });
});
