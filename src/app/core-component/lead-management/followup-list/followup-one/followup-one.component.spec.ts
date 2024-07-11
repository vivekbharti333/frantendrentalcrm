import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupOneComponent } from './followup-one.component';

describe('FollowupOneComponent', () => {
  let component: FollowupOneComponent;
  let fixture: ComponentFixture<FollowupOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowupOneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FollowupOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
