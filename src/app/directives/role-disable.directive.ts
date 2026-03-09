import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  inject
} from '@angular/core';
import { Rol } from '../enums/rol.enum';
import { SessionService } from '../services/session.service';

@Directive({
  selector: '[appRoleDisable]',
  standalone: true
}) 

export class RoleDisableDirective implements OnInit {
  @Input('appRoleDisable') rolesPermitidos: Rol[] = [];

  private elementRef = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private sessionService = inject(SessionService);

  ngOnInit(): void {
    const usuario = this.sessionService.usuarioActual();
    const tienePermiso =
      !!usuario && this.rolesPermitidos.includes(usuario.rol as Rol);

    if (!tienePermiso) {
      const elemento = this.elementRef.nativeElement;

      this.renderer.setProperty(elemento, 'disabled', true);
      this.renderer.setStyle(elemento, 'opacity', '0.6');
      this.renderer.setStyle(elemento, 'cursor', 'not-allowed');
      this.renderer.setAttribute(
        elemento,
        'title',
        'No tiene permisos para realizar esta acción'
      );
    }
  }
}