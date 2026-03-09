import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { Rol } from '../../enums/rol.enum';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  mensajeError = '';
  enviando = false;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  iniciarSesion(): void {
    this.mensajeError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;

    const { username, password } = this.form.getRawValue();
    const resultado = this.authService.login(username, password);

    this.enviando = false;

    if (!resultado.ok) {
      this.mensajeError = resultado.message;
      return;
    }

    const rol = resultado.usuario?.rol;

    if (rol === Rol.ADMIN || rol === Rol.SUPERVISOR) {
      this.router.navigate(['/usuarios']);
      return;
    }

    if (rol === Rol.OPERADOR) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.router.navigate(['/login']);
  }
}