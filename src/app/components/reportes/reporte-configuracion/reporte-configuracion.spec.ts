import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteConfiguracion } from './reporte-configuracion';

describe('ReporteConfiguracion', () => {
  let component: ReporteConfiguracion;
  let fixture: ComponentFixture<ReporteConfiguracion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteConfiguracion],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteConfiguracion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
