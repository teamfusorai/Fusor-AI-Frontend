import { TestBed } from '@angular/core/testing';
import { AuthLoaderService } from './auth-loader.service';

describe('AuthLoaderService', () => {
  let service: AuthLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
