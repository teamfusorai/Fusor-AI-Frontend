import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ErrorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true,
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['logout'])
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    const interceptor = TestBed.inject(HTTP_INTERCEPTORS).find(i => i instanceof ErrorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
