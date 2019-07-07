import { TestBed } from '@angular/core/testing';

import { UserAuthHttpService } from './user-auth-http.service';

describe('UserAuthHttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserAuthHttpService = TestBed.get(UserAuthHttpService);
    expect(service).toBeTruthy();
  });
});
