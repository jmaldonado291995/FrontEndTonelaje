import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPrincipalComponent } from './dashboard-principal';

describe('DashboardPrincipalComponent', () => {
  let component: DashboardPrincipalComponent;
  let fixture: ComponentFixture<DashboardPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPrincipalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPrincipalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
