import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecheckComponent } from './recheck.component';

describe('RecheckComponent', () => {
  let component: RecheckComponent;
  let fixture: ComponentFixture<RecheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
