/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KpiReportComponent } from './kpi-report.component';

describe('KpiReportComponent', () => {
  let component: KpiReportComponent;
  let fixture: ComponentFixture<KpiReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
