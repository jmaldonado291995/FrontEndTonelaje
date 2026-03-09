import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { UsuarioListaComponent } from './components/usuarios/usuario-lista/usuario-lista';
import { TurnoListaComponent } from './components/turnos/turno-lista/turno-lista';
import { DashboardPrincipalComponent } from './components/dashboard/dashboard-principal/dashboard-principal';
import { ReporteConfiguracionComponent } from './components/reportes/reporte-configuracion/reporte-configuracion';
import { ReporteManualComponent } from './components/reportes/reporte-manual/reporte-manual';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'usuarios', component: UsuarioListaComponent },
      { path: 'turnos', component: TurnoListaComponent },
      { path: 'dashboard', component: DashboardPrincipalComponent },
      { path: 'reportes/configuracion', component: ReporteConfiguracionComponent },
      { path: 'reportes/manual', component: ReporteManualComponent },
    ]
  }, 
  { path: '**', redirectTo: 'login' }
];