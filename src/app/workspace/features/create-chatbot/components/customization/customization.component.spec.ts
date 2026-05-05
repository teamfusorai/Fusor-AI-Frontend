import { TestBed } from '@angular/core/testing';
import { CustomizationComponent } from './customization.component';

describe('CustomizationComponent', () => {
  let component: CustomizationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    const fixture = TestBed.createComponent(CustomizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
