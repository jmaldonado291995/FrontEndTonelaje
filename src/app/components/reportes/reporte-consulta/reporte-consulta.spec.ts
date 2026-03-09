import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteConsulta } from './reporte-consulta';

describe('ReporteConsulta', () => {
  let component: ReporteConsulta;
  let fixture: ComponentFixture<ReporteConsulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteConsulta],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteConsulta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
