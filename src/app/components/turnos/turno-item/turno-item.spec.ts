import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnoItem } from './turno-item';

describe('TurnoItem', () => {
  let component: TurnoItem;
  let fixture: ComponentFixture<TurnoItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnoItem],
    }).compileComponents();

    fixture = TestBed.createComponent(TurnoItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
