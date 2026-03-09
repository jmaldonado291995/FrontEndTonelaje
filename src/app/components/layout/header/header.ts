import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Rol } from '../../../enums/rol.enum';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly usuarioActual = computed(() => this.sessionService.usuarioActual());

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getNombreRol(rol?: Rol): string {
    switch (rol) {
      case Rol.ADMIN:
        return 'Administrador';
      case Rol.SUPERVISOR:
        return 'Supervisor';
      case Rol.OPERADOR:
        return 'Operador';
      default:
        return '';
    }
  }
}