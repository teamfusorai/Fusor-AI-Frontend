import { TestBed } from '@angular/core/testing';
import { BasicInfoComponent } from './basic-info.component';

describe('BasicInfoComponent', () => {
  let component: BasicInfoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    const fixture = TestBed.createComponent(BasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
