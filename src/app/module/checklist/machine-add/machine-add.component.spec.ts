/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MachineAddComponent } from './machine-add.component';

describe('MachineAddComponent', () => {
  let component: MachineAddComponent;
  let fixture: ComponentFixture<MachineAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
