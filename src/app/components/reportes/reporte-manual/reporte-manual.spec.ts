import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteManual } from './reporte-manual';

describe('ReporteManual', () => {
  let component: ReporteManual;
  let fixture: ComponentFixture<ReporteManual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteManual],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteManual);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
