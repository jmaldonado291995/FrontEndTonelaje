import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioItem } from './usuario-item';

describe('UsuarioItem', () => {
  let component: UsuarioItem;
  let fixture: ComponentFixture<UsuarioItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioItem],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
