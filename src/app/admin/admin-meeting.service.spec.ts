import { TestBed } from '@angular/core/testing';

import { AdminMeetingService } from './admin-meeting.service';

describe('AdminMeetingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdminMeetingService = TestBed.get(AdminMeetingService);
    expect(service).toBeTruthy();
  });
});
