import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnoFormulario } from './turno-formulario';

describe('TurnoFormulario', () => {
  let component: TurnoFormulario;
  let fixture: ComponentFixture<TurnoFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnoFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(TurnoFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
