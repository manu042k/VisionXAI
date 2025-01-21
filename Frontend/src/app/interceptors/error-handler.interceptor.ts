import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status) {
        messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.detail,
          life: 3000,
        });
      }
      return throwError(() => error);
    })
  );
};
