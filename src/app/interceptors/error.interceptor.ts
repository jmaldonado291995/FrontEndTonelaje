import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiFeedbackService } from '../services/ui-feedback.service';

const DEFAULT_ERROR_TITLE = 'Ocurrió un problema';
const DEFAULT_ERROR_MESSAGE = 'No se pudo completar la solicitud.';
const NETWORK_ERROR_MESSAGE = 'No se pudo establecer conexión con el servidor.';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const uiFeedbackService = inject(UiFeedbackService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const { title, message } = extractErrorContent(error);
        uiFeedbackService.showErrorModal(title, message);
      }

      return throwError(() => error);
    })
  );
};

function extractErrorContent(error: HttpErrorResponse): { title: string; message: string } {
  const payload = unwrapPayload(error.error);

  return {
    title: pickFirstString([payload?.title, error.error?.title]) ?? DEFAULT_ERROR_TITLE,
    message:
      resolveMessage(payload) ??
      (error.status === 0 ? NETWORK_ERROR_MESSAGE : DEFAULT_ERROR_MESSAGE)
  };
}

function unwrapPayload(payload: unknown): any {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  if ('error' in payload && payload.error && typeof payload.error === 'object') {
    return payload.error;
  }

  return payload;
}

function resolveMessage(payload: any): string | undefined {
  if (typeof payload === 'string') {
    return payload.trim() || undefined;
  }

  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const directMessage = pickFirstString([
    payload.message,
    payload.detail,
    payload.error_description,
    typeof payload.error === 'string' ? payload.error : undefined
  ]);

  if (directMessage) {
    return directMessage;
  }

  if (!Array.isArray(payload.errors)) {
    return undefined;
  }

  const messages = payload.errors
    .map((item: unknown) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (!item || typeof item !== 'object') {
        return '';
      }

      return (
        pickFirstString([
          (item as any).message,
          (item as any).defaultMessage,
          (item as any).detail,
          (item as any).reason
        ]) ?? ''
      );
    })
    .filter(Boolean);

  return messages.length > 0 ? messages.join('\n') : undefined;
}

function pickFirstString(values: Array<string | undefined | null>): string | undefined {
  return values.find(value => typeof value === 'string' && value.trim().length > 0)?.trim();
}
