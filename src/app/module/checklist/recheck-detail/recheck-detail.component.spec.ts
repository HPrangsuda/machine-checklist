import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecheckDetailComponent } from './recheck-detail.component';

describe('RecheckDetailComponent', () => {
  let component: RecheckDetailComponent;
  let fixture: ComponentFixture<RecheckDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecheckDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecheckDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
