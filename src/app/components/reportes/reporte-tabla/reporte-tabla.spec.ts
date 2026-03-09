import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTabla } from './reporte-tabla';

describe('ReporteTabla', () => {
  let component: ReporteTabla;
  let fixture: ComponentFixture<ReporteTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteTabla],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteTabla);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
