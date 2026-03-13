import { Injectable, computed, signal } from '@angular/core';

export interface ErrorModalState {
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiFeedbackService {
  private readonly _loadingCount = signal(0);
  private readonly _errorModal = signal<ErrorModalState | null>(null);

  readonly isLoading = computed(() => this._loadingCount() > 0);
  readonly errorModal = computed(() => this._errorModal());

  startLoading(): void {
    this._loadingCount.update(count => count + 1);
  }

  stopLoading(): void {
    this._loadingCount.update(count => Math.max(0, count - 1));
  }

  showErrorModal(title: string, message: string): void {
    this._errorModal.set({ title, message });
  }

  closeErrorModal(): void {
    this._errorModal.set(null);
  }
}
