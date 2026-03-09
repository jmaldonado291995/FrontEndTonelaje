import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Rol } from '../../../enums/rol.enum';
import { SessionService } from '../../../services/session.service';

interface MenuItem {
  label: string;
  route: string;
  roles: Rol[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  private sessionService = inject(SessionService);

  readonly usuarioActual = computed(() => this.sessionService.usuarioActual());
  readonly menuItems: MenuItem[] = [
    {
      label: 'Usuarios',
      route: '/usuarios',
      roles: [Rol.ADMIN, Rol.SUPERVISOR]
    },
    {
      label: 'Turnos',
      route: '/turnos',
      roles: [Rol.ADMIN, Rol.SUPERVISOR]
    },
    {
      label: 'Dashboard',
      route: '/dashboard',
      roles: [Rol.ADMIN, Rol.SUPERVISOR, Rol.OPERADOR]
    },
    {
      label: 'Configuración reporte',
      route: '/reportes/configuracion',
      roles: [Rol.ADMIN, Rol.SUPERVISOR]
    },
    {
      label: 'Reporte manual',
      route: '/reportes/manual',
      roles: [Rol.ADMIN, Rol.SUPERVISOR, Rol.OPERADOR]
    }
  ];

  readonly menuVisible = computed(() => {
    const usuario = this.usuarioActual();

    if (!usuario) {
      return [];
    }

    return this.menuItems.filter(item => item.roles.includes(usuario.rol));
  });
}