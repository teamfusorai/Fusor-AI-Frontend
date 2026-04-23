import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FusorButtonComponent } from './fusor-button.component';

describe('FusorButtonComponent', () => {
  let component: FusorButtonComponent;
  let fixture: ComponentFixture<FusorButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FusorButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FusorButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
