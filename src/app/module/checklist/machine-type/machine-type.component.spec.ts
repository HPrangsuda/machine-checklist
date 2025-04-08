import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineTypeComponent } from './machine-type.component';

describe('MachineTypeComponent', () => {
  let component: MachineTypeComponent;
  let fixture: ComponentFixture<MachineTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachineTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
