import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FusorInputComponent } from './fusor-input.component';

describe('FusorInputComponent', () => {
  let component: FusorInputComponent;
  let fixture: ComponentFixture<FusorInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FusorInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FusorInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
