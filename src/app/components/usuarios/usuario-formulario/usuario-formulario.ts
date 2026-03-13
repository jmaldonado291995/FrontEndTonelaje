import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Rol } from '../../../enums/rol.enum';
import { passwordMatchValidator } from '../../../directives/password-match.directive';
import { Usuario } from '../../../models/usuario.model';
import { SessionService } from '../../../services/session.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-usuario-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-formulario.html',
  styleUrl: './usuario-formulario.scss'
})
export class UsuarioFormularioComponent implements OnChanges {
  @Input() usuarioEditar: Usuario | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private sessionService = inject(SessionService);

  readonly Rol = Rol;
  mensaje = '';
  error = '';
  usuarioActual = computed(() => this.sessionService.usuarioActual());

  rolesDisponibles: Rol[] = [];

  form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      rol: ['', [Validators.required]]
    },
    {
      validators: [passwordMatchValidator('password', 'confirmPassword')]
    }
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarioEditar']) {
      if (this.usuarioEditar) {
        this.form.patchValue({
          username: this.usuarioEditar.username,
          password: '',
          confirmPassword: '',
          rol: this.usuarioEditar.rol
        });
      } else {
        this.limpiarFormulario();
      }
    }

    this.cargarRolesDisponibles();
  }

  get modoEdicion(): boolean {
    return !!this.usuarioEditar;
  }

  cargarRolesDisponibles(): void {
    const usuario = this.usuarioActual();

    if (!usuario) {
      this.rolesDisponibles = [];
      return;
    }

    if (usuario.rol === Rol.ADMIN) {
      this.rolesDisponibles = [Rol.ADMIN, Rol.SUPERVISOR, Rol.OPERADOR];
      return;
    }

    if (usuario.rol === Rol.SUPERVISOR) {
      this.rolesDisponibles =
        !this.usuarioEditar || this.usuarioEditar.rol === Rol.OPERADOR
          ? [Rol.OPERADOR]
          : [];
      return;
    }

    this.rolesDisponibles = [];
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const usuarioSesion = this.usuarioActual();

    if (!usuarioSesion) {
      this.error = 'No existe una sesión activa';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password, rol } = this.form.getRawValue();

    if (!rol) {
      this.error = 'Debe seleccionar un rol';
      return;
    }

    if (!this.modoEdicion && !this.usuarioService.puedeCrearRol(usuarioSesion.rol, rol as Rol)) {
      this.error = 'No tiene permisos para registrar este tipo de usuario';
      return;
    }

    if (this.modoEdicion && this.usuarioEditar) {
      if (!this.usuarioService.puedeActualizarUsuario(usuarioSesion.rol, this.usuarioEditar, rol as Rol)) {
        this.error = 'No tiene permisos para actualizar este usuario';
        return;
      }

      const resultado = await this.usuarioService.actualizar(this.usuarioEditar.id, {
        username: username!,
        password: password!,
        rol: rol as Rol
      });

      if (!resultado.ok) {
        this.error = resultado.message;
        return;
      }

      this.mensaje = resultado.message;
      this.guardado.emit();
      this.limpiarFormulario();
      return;
    }

    const resultado = await this.usuarioService.crear({
      username: username!,
      password: password!,
      rol: rol as Rol
    });

    if (!resultado.ok) {
      this.error = resultado.message;
      return;
    }

    this.mensaje = resultado.message;
    this.guardado.emit();
    this.limpiarFormulario();
  }

  cancelarEdicion(): void {
    this.usuarioEditar = null;
    this.limpiarFormulario();
    this.cancelado.emit();
  }

  private limpiarFormulario(): void {
    this.form.reset({
      username: '',
      password: '',
      confirmPassword: '',
      rol: ''
    });
  }
}
