import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordMatch {
  constructor() {}
}

export function passwordMatchValidator(
  passwordKey: string,
  confirmPasswordKey: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const passwordControl = formGroup.get(passwordKey);
    const confirmPasswordControl = formGroup.get(confirmPasswordKey);

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    const password = passwordControl.value;
    const confirmPassword = confirmPasswordControl.value;

    if (password !== confirmPassword) {
      confirmPasswordControl.setErrors({
        ...(confirmPasswordControl.errors || {}),
        passwordMismatch: true
      });
      return { passwordMismatch: true };
    }

    if (confirmPasswordControl.errors) {
      const { passwordMismatch, ...otrosErrores } = confirmPasswordControl.errors;
      const nuevosErrores =
        Object.keys(otrosErrores).length > 0 ? otrosErrores : null;
      confirmPasswordControl.setErrors(nuevosErrores);
    }

    return null;
  };
}