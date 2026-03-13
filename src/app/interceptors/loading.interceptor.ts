import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { UiFeedbackService } from '../services/ui-feedback.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const uiFeedbackService = inject(UiFeedbackService);

  uiFeedbackService.startLoading();

  return next(req).pipe(finalize(() => uiFeedbackService.stopLoading()));
};
