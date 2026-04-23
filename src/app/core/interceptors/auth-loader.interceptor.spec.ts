import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthLoaderInterceptor } from './auth-loader.interceptor';

describe('AuthLoaderInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AuthLoaderInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor = TestBed.inject(AuthLoaderInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
